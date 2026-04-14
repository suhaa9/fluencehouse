# Fluence House - PRD

## Original Problem Statement
Fluence House is a digital platform that connects influencers and brands to collaborate efficiently on marketing campaigns. Two-sided marketplace with dual auth, campaign management, application workflow, and payout system.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI (port 3000)
- **Backend**: FastAPI (port 8001, /api prefix)
- **Database**: MongoDB (fluence_house)
- **Auth**: Dual - JWT (email/password) + Emergent Google OAuth
- **Payments**: Razorpay (MOCKED for MVP)

## User Personas
1. **Influencer**: Creates profile, browses campaigns, applies, tracks earnings
2. **Brand**: Posts campaigns, discovers influencers, reviews applications, manages payouts

## Core Requirements
- Dual authentication (JWT + Google OAuth)
- Role-based dashboards (Influencer Bento / Brand Control Room)
- Campaign CRUD with search/filter
- Application lifecycle (apply → approve/reject)
- Payout management with Razorpay
- Earnings tracking
- Influencer discovery for brands
- Campaign status management

## What's Been Implemented (2026-04-14)
### Phase 1 (MVP)
- Full dual auth with token refresh mechanism
- Role-based registration and dashboards
- Campaign creation, listing, browsing, detail view
- Application system (submit proposal, approve/reject)
- Payout system (create, track)
- Earnings page for influencers
- Premium UI with Indigo/Violet theme, Outfit + Manrope fonts
- Glassmorphism header, card-based layouts

### Phase 2 (Feature additions)
- Influencer Discovery page for brands (search, niche filter, sort by followers)
- Influencer Detail page (profile stats, social links, collaboration count)
- Campaign status management (active/paused/closed/archived via dropdown)
- Mobile-responsive hamburger navigation (Shadcn Sheet drawer)
- Active route highlighting in navigation

## Prioritized Backlog
### P0 (Done)
- Auth, Dashboards, Campaigns, Applications, Payouts
- Influencer Discovery, Campaign Status, Mobile Nav

### P1 (Next)
- Razorpay live integration (requires API keys from user)
- Notification system (new applications, status changes)
- In-app messaging between brands and influencers

### P2 (Future)
- AI-based influencer-brand matching
- Credibility/rating system
- Campaign performance analytics
- Automated contracts
- Admin panel
