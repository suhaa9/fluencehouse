#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class FluenceHouseAPITester:
    def __init__(self, base_url="https://campaign-marketplace.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_user = None
        self.influencer_user = None
        self.brand_user = None
        self.test_campaign_id = None
        self.test_application_id = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test admin login
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": "admin@fluencehouse.com",
                "password": "Admin@123"
            })
            
            if response.status_code == 200:
                self.admin_user = response.json()
                self.log_test("Admin Login", True, f"- User ID: {self.admin_user.get('user_id')}")
            else:
                self.log_test("Admin Login", False, f"- Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("Admin Login", False, f"- Error: {str(e)}")
            return False

        # Test /auth/me endpoint
        try:
            response = self.session.get(f"{self.base_url}/auth/me")
            success = response.status_code == 200
            self.log_test("Get Current User", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Current User", False, f"- Error: {str(e)}")

        # Test user registration (influencer)
        try:
            test_email = f"test_influencer_{datetime.now().strftime('%H%M%S')}@test.com"
            response = self.session.post(f"{self.base_url}/auth/register", json={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test Influencer",
                "role": "influencer"
            })
            
            if response.status_code == 200:
                self.influencer_user = response.json()
                self.log_test("Influencer Registration", True, f"- Email: {test_email}")
            else:
                self.log_test("Influencer Registration", False, f"- Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Influencer Registration", False, f"- Error: {str(e)}")

        # Test user registration (brand)
        try:
            test_email = f"test_brand_{datetime.now().strftime('%H%M%S')}@test.com"
            response = self.session.post(f"{self.base_url}/auth/register", json={
                "email": test_email,
                "password": "TestPass123!",
                "name": "Test Brand",
                "role": "brand"
            })
            
            if response.status_code == 200:
                self.brand_user = response.json()
                self.log_test("Brand Registration", True, f"- Email: {test_email}")
            else:
                self.log_test("Brand Registration", False, f"- Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Brand Registration", False, f"- Error: {str(e)}")

        # Test token refresh endpoint
        try:
            response = self.session.post(f"{self.base_url}/auth/refresh")
            success = response.status_code == 200
            self.log_test("Token Refresh", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Token Refresh", False, f"- Error: {str(e)}")

        # Test logout
        try:
            response = self.session.post(f"{self.base_url}/auth/logout")
            success = response.status_code == 200
            self.log_test("Logout", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Logout", False, f"- Error: {str(e)}")

        return True

    def test_influencer_endpoints(self):
        """Test influencer-specific endpoints"""
        print("\n👤 Testing Influencer Endpoints...")
        
        if not self.influencer_user:
            print("❌ Skipping influencer tests - no influencer user available")
            return False

        # Login as influencer first
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": self.influencer_user["email"],
                "password": "TestPass123!"
            })
            if response.status_code != 200:
                self.log_test("Influencer Login", False, f"- Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Influencer Login", False, f"- Error: {str(e)}")
            return False

        # Test get influencer profile
        try:
            response = self.session.get(f"{self.base_url}/influencer/profile")
            success = response.status_code == 200
            self.log_test("Get Influencer Profile", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Influencer Profile", False, f"- Error: {str(e)}")

        # Test update influencer profile
        try:
            response = self.session.put(f"{self.base_url}/influencer/profile", json={
                "bio": "Test bio for influencer",
                "followers": 10000,
                "niche": "Fashion",
                "instagram": "@testinfluencer"
            })
            success = response.status_code == 200
            self.log_test("Update Influencer Profile", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Update Influencer Profile", False, f"- Error: {str(e)}")

        # Test list influencers
        try:
            response = self.session.get(f"{self.base_url}/influencers")
            success = response.status_code == 200
            self.log_test("List Influencers", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("List Influencers", False, f"- Error: {str(e)}")

        return True

    def test_campaign_endpoints(self):
        """Test campaign-related endpoints"""
        print("\n📋 Testing Campaign Endpoints...")
        
        if not self.brand_user:
            print("❌ Skipping campaign tests - no brand user available")
            return False

        # Login as brand first
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": self.brand_user["email"],
                "password": "TestPass123!"
            })
            if response.status_code != 200:
                self.log_test("Brand Login", False, f"- Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Brand Login", False, f"- Error: {str(e)}")
            return False

        # Test create campaign
        try:
            response = self.session.post(f"{self.base_url}/campaigns", json={
                "title": "Test Fashion Campaign",
                "description": "A test campaign for fashion influencers",
                "budget": 50000.0,
                "requirements": "Minimum 10k followers",
                "niche": "Fashion",
                "deadline": "2024-12-31"
            })
            
            if response.status_code == 200:
                campaign_data = response.json()
                self.test_campaign_id = campaign_data.get("campaign_id")
                self.log_test("Create Campaign", True, f"- Campaign ID: {self.test_campaign_id}")
            else:
                self.log_test("Create Campaign", False, f"- Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Campaign", False, f"- Error: {str(e)}")

        # Test list campaigns
        try:
            response = self.session.get(f"{self.base_url}/campaigns")
            success = response.status_code == 200
            self.log_test("List Campaigns", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("List Campaigns", False, f"- Error: {str(e)}")

        # Test my campaigns
        try:
            response = self.session.get(f"{self.base_url}/campaigns/my")
            success = response.status_code == 200
            self.log_test("My Campaigns", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("My Campaigns", False, f"- Error: {str(e)}")

        # Test get specific campaign
        if self.test_campaign_id:
            try:
                response = self.session.get(f"{self.base_url}/campaigns/{self.test_campaign_id}")
                success = response.status_code == 200
                self.log_test("Get Campaign Details", success, f"- Status: {response.status_code}")
            except Exception as e:
                self.log_test("Get Campaign Details", False, f"- Error: {str(e)}")

        return True

    def test_campaign_status_management(self):
        """Test campaign status management endpoints"""
        print("\n🔄 Testing Campaign Status Management...")
        
        if not self.brand_user or not self.test_campaign_id:
            print("❌ Skipping campaign status tests - missing required data")
            return False

        # Login as brand first
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": self.brand_user["email"],
                "password": "TestPass123!"
            })
            if response.status_code != 200:
                self.log_test("Brand Login for Status Management", False, f"- Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Brand Login for Status Management", False, f"- Error: {str(e)}")
            return False

        # Test pause campaign
        try:
            response = self.session.patch(f"{self.base_url}/campaigns/{self.test_campaign_id}/status", json={
                "status": "paused"
            })
            success = response.status_code == 200
            self.log_test("Pause Campaign", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Pause Campaign", False, f"- Error: {str(e)}")

        # Test reactivate campaign
        try:
            response = self.session.patch(f"{self.base_url}/campaigns/{self.test_campaign_id}/status", json={
                "status": "active"
            })
            success = response.status_code == 200
            self.log_test("Reactivate Campaign", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Reactivate Campaign", False, f"- Error: {str(e)}")

        # Test close campaign
        try:
            response = self.session.patch(f"{self.base_url}/campaigns/{self.test_campaign_id}/status", json={
                "status": "closed"
            })
            success = response.status_code == 200
            self.log_test("Close Campaign", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Close Campaign", False, f"- Error: {str(e)}")

        # Test archive campaign
        try:
            response = self.session.patch(f"{self.base_url}/campaigns/{self.test_campaign_id}/status", json={
                "status": "archived"
            })
            success = response.status_code == 200
            self.log_test("Archive Campaign", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Archive Campaign", False, f"- Error: {str(e)}")

        # Test invalid status
        try:
            response = self.session.patch(f"{self.base_url}/campaigns/{self.test_campaign_id}/status", json={
                "status": "invalid_status"
            })
            success = response.status_code == 400  # Should return 400 for invalid status
            self.log_test("Invalid Status Rejection", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Status Rejection", False, f"- Error: {str(e)}")

        return True

    def test_application_endpoints(self):
        """Test application-related endpoints"""
        print("\n📝 Testing Application Endpoints...")
        
        if not self.influencer_user or not self.test_campaign_id:
            print("❌ Skipping application tests - missing influencer user or campaign")
            return False

        # Login as influencer
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": self.influencer_user["email"],
                "password": "TestPass123!"
            })
            if response.status_code != 200:
                self.log_test("Influencer Login for Applications", False, f"- Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Influencer Login for Applications", False, f"- Error: {str(e)}")
            return False

        # Test create application
        try:
            response = self.session.post(f"{self.base_url}/applications", json={
                "campaign_id": self.test_campaign_id,
                "proposal": "I would love to work on this campaign. I have experience in fashion content."
            })
            
            if response.status_code == 200:
                app_data = response.json()
                self.test_application_id = app_data.get("application_id")
                self.log_test("Create Application", True, f"- Application ID: {self.test_application_id}")
            else:
                self.log_test("Create Application", False, f"- Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Application", False, f"- Error: {str(e)}")

        # Test my applications
        try:
            response = self.session.get(f"{self.base_url}/applications/my")
            success = response.status_code == 200
            self.log_test("My Applications", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("My Applications", False, f"- Error: {str(e)}")

        return True

    def test_application_management(self):
        """Test application approval/rejection by brands"""
        print("\n⚖️ Testing Application Management...")
        
        if not self.brand_user or not self.test_campaign_id or not self.test_application_id:
            print("❌ Skipping application management tests - missing required data")
            return False

        # Login as brand
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": self.brand_user["email"],
                "password": "TestPass123!"
            })
            if response.status_code != 200:
                self.log_test("Brand Login for App Management", False, f"- Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Brand Login for App Management", False, f"- Error: {str(e)}")
            return False

        # Test get campaign applications
        try:
            response = self.session.get(f"{self.base_url}/campaigns/{self.test_campaign_id}/applications")
            success = response.status_code == 200
            self.log_test("Get Campaign Applications", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Get Campaign Applications", False, f"- Error: {str(e)}")

        # Test approve application
        try:
            response = self.session.patch(f"{self.base_url}/applications/{self.test_application_id}", json={
                "action": "approve"
            })
            success = response.status_code == 200
            self.log_test("Approve Application", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("Approve Application", False, f"- Error: {str(e)}")

        return True

    def test_payout_endpoints(self):
        """Test payout-related endpoints"""
        print("\n💰 Testing Payout Endpoints...")
        
        if not self.brand_user or not self.test_application_id:
            print("❌ Skipping payout tests - missing required data")
            return False

        # Login as brand
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json={
                "email": self.brand_user["email"],
                "password": "TestPass123!"
            })
            if response.status_code != 200:
                self.log_test("Brand Login for Payouts", False, f"- Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Brand Login for Payouts", False, f"- Error: {str(e)}")
            return False

        # Test create payout
        try:
            response = self.session.post(f"{self.base_url}/payouts", json={
                "application_id": self.test_application_id,
                "amount": 25000.0
            })
            success = response.status_code == 200
            if success:
                payout_data = response.json()
                self.log_test("Create Payout", True, f"- Payout ID: {payout_data.get('payout_id')}")
            else:
                self.log_test("Create Payout", False, f"- Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Create Payout", False, f"- Error: {str(e)}")

        # Test my payouts (brand perspective)
        try:
            response = self.session.get(f"{self.base_url}/payouts/my")
            success = response.status_code == 200
            self.log_test("My Payouts (Brand)", success, f"- Status: {response.status_code}")
        except Exception as e:
            self.log_test("My Payouts (Brand)", False, f"- Error: {str(e)}")

        # Test my payouts (influencer perspective)
        if self.influencer_user:
            try:
                response = self.session.post(f"{self.base_url}/auth/login", json={
                    "email": self.influencer_user["email"],
                    "password": "TestPass123!"
                })
                if response.status_code == 200:
                    response = self.session.get(f"{self.base_url}/payouts/my")
                    success = response.status_code == 200
                    self.log_test("My Payouts (Influencer)", success, f"- Status: {response.status_code}")
            except Exception as e:
                self.log_test("My Payouts (Influencer)", False, f"- Error: {str(e)}")

        return True

    def test_dashboard_stats(self):
        """Test dashboard statistics endpoints"""
        print("\n📊 Testing Dashboard Stats...")
        
        # Test influencer stats
        if self.influencer_user:
            try:
                response = self.session.post(f"{self.base_url}/auth/login", json={
                    "email": self.influencer_user["email"],
                    "password": "TestPass123!"
                })
                if response.status_code == 200:
                    response = self.session.get(f"{self.base_url}/dashboard/stats")
                    success = response.status_code == 200
                    self.log_test("Influencer Dashboard Stats", success, f"- Status: {response.status_code}")
            except Exception as e:
                self.log_test("Influencer Dashboard Stats", False, f"- Error: {str(e)}")

        # Test brand stats
        if self.brand_user:
            try:
                response = self.session.post(f"{self.base_url}/auth/login", json={
                    "email": self.brand_user["email"],
                    "password": "TestPass123!"
                })
                if response.status_code == 200:
                    response = self.session.get(f"{self.base_url}/dashboard/stats")
                    success = response.status_code == 200
                    self.log_test("Brand Dashboard Stats", success, f"- Status: {response.status_code}")
            except Exception as e:
                self.log_test("Brand Dashboard Stats", False, f"- Error: {str(e)}")

        return True

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Fluence House API Testing...")
        print(f"🔗 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_auth_endpoints()
        self.test_influencer_endpoints()
        self.test_campaign_endpoints()
        self.test_campaign_status_management()
        self.test_application_endpoints()
        self.test_application_management()
        self.test_payout_endpoints()
        self.test_dashboard_stats()
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 Final Results: {self.tests_passed}/{self.tests_run} tests passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Backend API testing completed successfully!")
            return 0
        else:
            print("⚠️ Some tests failed. Please check the issues above.")
            return 1

def main():
    tester = FluenceHouseAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())