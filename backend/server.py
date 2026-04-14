from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
import secrets
from bson import ObjectId

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]

# Razorpay Client
razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID', 'test_key'), os.environ.get('RAZORPAY_KEY_SECRET', 'test_secret')))

# Password Hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT Token Management
def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=15), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

# Auth Helper
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    
    # Also check for session_token (Google OAuth)
    session_token = request.cookies.get("session_token")
    if session_token and not token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session["expires_at"]
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < datetime.now(timezone.utc):
                raise HTTPException(status_code=401, detail="Session expired")
            user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            user.pop("password_hash", None)
            return user
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Pydantic Models
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # "influencer" or "brand"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthSession(BaseModel):
    session_id: str

class InfluencerProfileUpdate(BaseModel):
    bio: Optional[str] = None
    followers: Optional[int] = None
    niche: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None
    twitter: Optional[str] = None
    portfolio_items: Optional[List[dict]] = None

class CampaignCreate(BaseModel):
    title: str
    description: str
    budget: float
    requirements: str
    niche: str
    deadline: str

class ApplicationCreate(BaseModel):
    campaign_id: str
    proposal: str

class ApplicationAction(BaseModel):
    action: str  # "approve" or "reject"

class PayoutCreate(BaseModel):
    application_id: str
    amount: float

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Auth Endpoints
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed = hash_password(req.password)
    
    user_doc = {
        "user_id": user_id,
        "email": email,
        "name": req.name,
        "role": req.role,
        "password_hash": hashed,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create profile based on role
    if req.role == "influencer":
        await db.influencer_profiles.insert_one({
            "user_id": user_id,
            "bio": "",
            "followers": 0,
            "niche": "",
            "instagram": "",
            "youtube": "",
            "tiktok": "",
            "twitter": "",
            "portfolio_items": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    
    user_doc.pop("password_hash")
    user_doc.pop("_id", None)
    return user_doc

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(user["user_id"], email)
    refresh_token = create_refresh_token(user["user_id"])
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    
    user.pop("password_hash")
    return user

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("session_token")
    return {"message": "Logged out"}

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload["sub"]
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        # Issue a fresh access token
        access_token = create_access_token(user_id, user["email"])
        response.set_cookie(
            key="access_token", value=access_token,
            httponly=True, secure=True, samesite="none",
            max_age=900, path="/"
        )

        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/google-session")
async def google_session(req: GoogleAuthSession, response: Response):
    import httpx
    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": req.session_id}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        data = res.json()
        email = data["email"].lower()
        
        # Check if user exists
        user = await db.users.find_one({"email": email}, {"_id": 0})
        
        if not user:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": data.get("name", ""),
                "role": "influencer",  # Default to influencer
                "picture": data.get("picture", ""),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
            
            # Create influencer profile
            await db.influencer_profiles.insert_one({
                "user_id": user_id,
                "bio": "",
                "followers": 0,
                "niche": "",
                "instagram": "",
                "youtube": "",
                "tiktok": "",
                "twitter": "",
                "portfolio_items": [],
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            user = user_doc
        else:
            user_id = user["user_id"]
        
        # Store session
        session_token = data["session_token"]
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        })
        
        response.set_cookie(key="session_token", value=session_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
        
        user.pop("password_hash", None)
        user.pop("_id", None)
        return user

# Influencer Profile Endpoints
@api_router.get("/influencer/profile")
async def get_influencer_profile(current_user: dict = Depends(get_current_user)):
    profile = await db.influencer_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {**current_user, **profile}

@api_router.put("/influencer/profile")
async def update_influencer_profile(req: InfluencerProfileUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can update profile")
    
    update_data = {k: v for k, v in req.model_dump().items() if v is not None}
    if update_data:
        await db.influencer_profiles.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": update_data}
        )
    
    profile = await db.influencer_profiles.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    return profile

@api_router.get("/influencers")
async def list_influencers(niche: Optional[str] = None):
    query = {}
    if niche:
        query["niche"] = {"$regex": niche, "$options": "i"}
    
    profiles = await db.influencer_profiles.find(query, {"_id": 0}).to_list(100)
    
    # Enrich with user data
    result = []
    for profile in profiles:
        user = await db.users.find_one({"user_id": profile["user_id"]}, {"_id": 0, "password_hash": 0})
        if user:
            result.append({**user, **profile})
    
    return result

@api_router.get("/influencers/{user_id}")
async def get_influencer_detail(user_id: str):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await db.influencer_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Get collaboration stats
    approved_apps = await db.applications.count_documents({"influencer_user_id": user_id, "status": "approved"})
    
    return {**user, **profile, "collaborations_count": approved_apps}

# Campaign Endpoints
@api_router.post("/campaigns")
async def create_campaign(req: CampaignCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can create campaigns")
    
    campaign_id = f"camp_{uuid.uuid4().hex[:12]}"
    campaign_doc = {
        "campaign_id": campaign_id,
        "brand_user_id": current_user["user_id"],
        "brand_name": current_user["name"],
        **req.model_dump(),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.campaigns.insert_one(campaign_doc)
    campaign_doc.pop("_id", None)
    return campaign_doc

@api_router.get("/campaigns")
async def list_campaigns(niche: Optional[str] = None, status: Optional[str] = "active"):
    query = {}
    if niche:
        query["niche"] = {"$regex": niche, "$options": "i"}
    if status:
        query["status"] = status
    
    campaigns = await db.campaigns.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return campaigns

@api_router.get("/campaigns/my")
async def my_campaigns(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can view their campaigns")
    
    campaigns = await db.campaigns.find({"brand_user_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with application counts
    result = []
    for campaign in campaigns:
        app_count = await db.applications.count_documents({"campaign_id": campaign["campaign_id"]})
        approved_count = await db.applications.count_documents({"campaign_id": campaign["campaign_id"], "status": "approved"})
        result.append({**campaign, "applications_count": app_count, "approved_count": approved_count})
    
    return result

@api_router.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str):
    campaign = await db.campaigns.find_one({"campaign_id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

# Application Endpoints
@api_router.post("/applications")
async def create_application(req: ApplicationCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can apply")
    
    # Check if already applied
    existing = await db.applications.find_one({
        "campaign_id": req.campaign_id,
        "influencer_user_id": current_user["user_id"]
    }, {"_id": 0})
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this campaign")
    
    app_id = f"app_{uuid.uuid4().hex[:12]}"
    app_doc = {
        "application_id": app_id,
        "campaign_id": req.campaign_id,
        "influencer_user_id": current_user["user_id"],
        "influencer_name": current_user["name"],
        "proposal": req.proposal,
        "status": "pending",
        "applied_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.applications.insert_one(app_doc)
    app_doc.pop("_id", None)
    return app_doc

@api_router.get("/applications/my")
async def my_applications(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can view applications")
    
    apps = await db.applications.find({"influencer_user_id": current_user["user_id"]}, {"_id": 0}).sort("applied_at", -1).to_list(100)
    
    # Enrich with campaign data
    result = []
    for app in apps:
        campaign = await db.campaigns.find_one({"campaign_id": app["campaign_id"]}, {"_id": 0})
        if campaign:
            result.append({**app, "campaign": campaign})
    
    return result

@api_router.get("/campaigns/{campaign_id}/applications")
async def campaign_applications(campaign_id: str, current_user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"campaign_id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign["brand_user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    apps = await db.applications.find({"campaign_id": campaign_id}, {"_id": 0}).sort("applied_at", -1).to_list(100)
    
    # Enrich with influencer data
    result = []
    for app in apps:
        influencer = await db.users.find_one({"user_id": app["influencer_user_id"]}, {"_id": 0, "password_hash": 0})
        profile = await db.influencer_profiles.find_one({"user_id": app["influencer_user_id"]}, {"_id": 0})
        if influencer and profile:
            result.append({**app, "influencer": {**influencer, **profile}})
    
    return result

@api_router.patch("/applications/{application_id}")
async def update_application(application_id: str, req: ApplicationAction, current_user: dict = Depends(get_current_user)):
    app = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    campaign = await db.campaigns.find_one({"campaign_id": app["campaign_id"]}, {"_id": 0})
    if campaign["brand_user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.applications.update_one(
        {"application_id": application_id},
        {"$set": {"status": "approved" if req.action == "approve" else "rejected"}}
    )
    
    updated = await db.applications.find_one({"application_id": application_id}, {"_id": 0})
    return updated

# Payout Endpoints
@api_router.post("/payouts")
async def create_payout(req: PayoutCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can create payouts")
    
    app = await db.applications.find_one({"application_id": req.application_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if app["status"] != "approved":
        raise HTTPException(status_code=400, detail="Application must be approved")
    
    # Check if payout already exists
    existing_payout = await db.payouts.find_one({"application_id": req.application_id}, {"_id": 0})
    if existing_payout:
        raise HTTPException(status_code=400, detail="Payout already created")
    
    # Create Razorpay order (mocked for testing)
    payout_id = f"payout_{uuid.uuid4().hex[:12]}"
    try:
        # For MVP, we'll create a mock order
        razorpay_order = {
            "id": f"order_{uuid.uuid4().hex[:12]}",
            "amount": int(req.amount * 100),
            "currency": "INR"
        }
    except Exception as e:
        razorpay_order = {"id": f"mock_order_{uuid.uuid4().hex[:8]}", "amount": int(req.amount * 100), "currency": "INR"}
    
    payout_doc = {
        "payout_id": payout_id,
        "application_id": req.application_id,
        "campaign_id": app["campaign_id"],
        "influencer_user_id": app["influencer_user_id"],
        "brand_user_id": current_user["user_id"],
        "amount": req.amount,
        "razorpay_order_id": razorpay_order["id"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payouts.insert_one(payout_doc)
    payout_doc.pop("_id", None)
    return payout_doc

@api_router.get("/payouts/my")
async def my_payouts(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "influencer":
        payouts = await db.payouts.find({"influencer_user_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    else:
        payouts = await db.payouts.find({"brand_user_id": current_user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    # Enrich with campaign data
    result = []
    for payout in payouts:
        campaign = await db.campaigns.find_one({"campaign_id": payout["campaign_id"]}, {"_id": 0})
        if campaign:
            result.append({**payout, "campaign": campaign})
    
    return result

@api_router.patch("/payouts/{payout_id}")
async def update_payout_status(payout_id: str, status: str):
    await db.payouts.update_one(
        {"payout_id": payout_id},
        {"$set": {"status": status}}
    )
    updated = await db.payouts.find_one({"payout_id": payout_id}, {"_id": 0})
    return updated

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "influencer":
        apps_count = await db.applications.count_documents({"influencer_user_id": current_user["user_id"]})
        approved_count = await db.applications.count_documents({"influencer_user_id": current_user["user_id"], "status": "approved"})
        
        # Calculate total earnings
        payouts = await db.payouts.find({"influencer_user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
        total_earnings = sum(p["amount"] for p in payouts)
        pending_earnings = sum(p["amount"] for p in payouts if p["status"] == "pending")
        
        return {
            "total_applications": apps_count,
            "approved_collaborations": approved_count,
            "total_earnings": total_earnings,
            "pending_earnings": pending_earnings
        }
    else:
        campaigns_count = await db.campaigns.count_documents({"brand_user_id": current_user["user_id"]})
        apps_count = 0
        
        campaigns = await db.campaigns.find({"brand_user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
        for campaign in campaigns:
            count = await db.applications.count_documents({"campaign_id": campaign["campaign_id"]})
            apps_count += count
        
        payouts = await db.payouts.find({"brand_user_id": current_user["user_id"]}, {"_id": 0}).to_list(1000)
        total_spent = sum(p["amount"] for p in payouts)
        
        return {
            "total_campaigns": campaigns_count,
            "total_applications": apps_count,
            "total_spent": total_spent,
            "active_collaborations": len([c for c in campaigns if c["status"] == "active"])
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        os.environ.get("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event - Seed Admin and Create Indexes
@app.on_event("startup")
async def startup_event():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.campaigns.create_index("campaign_id", unique=True)
    await db.applications.create_index("application_id", unique=True)
    await db.payouts.create_index("payout_id", unique=True)
    
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@fluencehouse.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if existing is None:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "user_id": user_id,
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "brand",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
    
    # Write test credentials
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: brand\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/logout\n")
        f.write("- POST /api/auth/google-session\n")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
