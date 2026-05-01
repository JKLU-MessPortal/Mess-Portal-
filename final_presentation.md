# 🍽️ JKLU Mess Management Portal
## Final / End-Term Presentation — Slide-by-Slide Content

> **Team:** Aman Singh (2023BTech006) · Anjisht Amritanshu (2023BTech009) · Ayush Choudhary (2023BTECH020)
> **Faculty Guide:** Dr. Deepika Prakash | Assistant Professor, CSE
> **Date:** May 2026

---

## SLIDE 1 — TITLE SLIDE

```
MINOR PROJECT | IET, JKLU

Mess Management Portal
A QR-Based Digital Mess Entry & Management System
for JK Lakshmipat University

Aman Singh · Anjisht Amritanshu · Ayush Choudhary
2023BTech006 | 2023BTech009 | 2023BTECH020

Faculty Guide: Dr. Deepika Prakash | May 2026

🔗 Live: mess-portal-jklu.vercel.app
```

---

## SLIDE 2 — INTRODUCTION (Updated from Mid-Term)

### About the Project

**Context**
- JKLU serves hundreds of students daily across 4 meal slots
- Previous system: physical ID cards → long queues, proxy entries, no analytics
- **Now:** A production-deployed, full-stack digital platform handling authentication, payments, nutrition, and community feedback

**Three User Personas**
- **Students** — Digital mess pass, meal management, payments, complaints, community voting
- **Mess Staff** — QR scanner, real-time verification, auto meal detection
- **Administrators** — Menu control, headcount analytics, refund ledger, student management

| 4 Meal Slots | 5 User Roles | 11 DB Models | 26+ API Endpoints |
|:---:|:---:|:---:|:---:|
| MERN Stack | Azure AD SSO | Razorpay Payments | Cloudinary Uploads |

---

## SLIDE 3 — PROBLEM STATEMENT (Same as Mid-Term)

### Challenges with the Existing System

| Challenge | Description |
|---|---|
| **Inefficient Entry** | Physical ID cards cause long queues; proxy entries undetected |
| **No Real-Time Tracking** | Zero digital record of meal consumption |
| **Food Wastage** | Kitchen prepares on rough estimates without advance headcount |
| **No Meal Flexibility** | Students cannot skip meals or track refund-eligible cancellations |
| **No Feedback Channel** | No structured way to report issues with photo evidence |
| **Admin Overhead** | Menu, headcount, refunds managed manually — error-prone |

---

## SLIDE 4 — PROPOSED SYSTEM (Expanded from Mid-Term)

### Key Features of the Portal

**From Mid-Term (Foundation)**
- ✅ QR-Based Entry — Digital mess pass, real-time scan & verify
- ✅ Auto Meal Detection — Server-clock determines Breakfast/Lunch/Snacks/Dinner
- ✅ Azure AD SSO — Only @jklu.edu.in emails, OAuth 2.0 via MSAL
- ✅ Kitchen Headcount Analytics — Tomorrow's cancellation count for food planning
- ✅ Refund Ledger — Per-student tracking with CSV export
- ✅ Admin Notices — Campus-wide broadcast system

**NEW Post Mid-Term Features**
- 🆕 **Razorpay Payments** — Non-veg bookings (₹30 egg / ₹120 chicken) + Day Scholar meal tickets (₹50)
- 🆕 **Community Polling** — Reddit-style voting with trending algorithm
- 🆕 **Nutritional Database** — 100+ dishes with fuzzy search
- 🆕 **Complaint Module** — Photo evidence via Cloudinary
- 🆕 **Day Scholar System** — Separate purchase flow, hosteller registry
- 🆕 **Dietary Filtering** — Veg/Non-Veg/Eggetarian/Jain menu views
- 🆕 **Production Deployment** — Live on Vercel + Render

---

## SLIDE 5 — SYSTEM ARCHITECTURE (Updated)

### Three-Tier Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Frontend) — Deployed on Vercel     │
│  React 18 + Vite · MSAL.js · Material UI · Axios       │
│  React Router v6 · QR Scanner · Razorpay Checkout       │
│  lucide-react · CSS3 Glassmorphism                      │
├─────────────────────────────────────────────────────────┤
│  APPLICATION LAYER (Backend) — Deployed on Render       │
│  Node.js + Express 5 · Mongoose ODM · CORS              │
│  Multer (uploads) · Razorpay SDK · crypto (HMAC)        │
│  multer-storage-cloudinary · dotenv                     │
├─────────────────────────────────────────────────────────┤
│  DATA LAYER (Database) — MongoDB Atlas (Cloud)          │
│  11 Mongoose Models · Compound Unique Indexes           │
│  Atomic Operations ($addToSet, $pull, findOneAndUpdate)  │
├─────────────────────────────────────────────────────────┤
│  THIRD-PARTY SERVICES                                   │
│  Microsoft Azure AD · Razorpay · Cloudinary · QR API    │
└─────────────────────────────────────────────────────────┘
```

**Key Change from Mid-Term:** Architecture went from 7 models/local dev → 11 models/production-deployed with payment gateway, image CDN, and cloud infrastructure.

---

## SLIDE 6 — MID-TERM IMPLEMENTATION (Recap)

### What Was Delivered at Mid-Term

**Backend (10+ API Endpoints, 7 Models)**
- `POST /api/auth/microsoft-login` — Azure SSO Login
- `POST /api/mess/scan` — QR Verification
- `GET /api/dashboard/data` — Student Dashboard
- `POST /api/dashboard/toggle` — Toggle Meal Skip
- `GET /api/admin/headcount` — Kitchen Headcount
- `GET /api/admin/ledger` — Refund Ledger
- Models: User, MealLog, Menu, MealBooking, Booking, Review, Notice

**Frontend (4 Pages)**
- AuthGate.jsx — Microsoft SSO login
- Dashboard.jsx — Student mess pass + meal management
- Scanner.jsx — Staff QR scanner
- AdminDashboard.jsx — Menu management + headcount + ledger

---

## SLIDE 7 — WORK DONE AFTER MID-TERM ⭐

### 7 Major Features Added Post Mid-Term

| # | Feature | Technical Highlight |
|---|---|---|
| 1 | **💳 Razorpay Payment System** | HMAC-SHA256 signature verification, 2 payment types (non-veg + Day Scholar meals), tiered pricing |
| 2 | **🗳️ Community Polling** | Trending algorithm `score = votes / (hours+2)^1.5`, atomic MongoDB voting, SVG donut charts, 2-step resolve |
| 3 | **🥗 Nutritional Database** | 100+ dishes, custom fuzzy search engine, animated progress bars, debounced API calls (280ms) |
| 4 | **📸 Complaint Module** | Cloudinary image CDN, Multer middleware, admin search/date filters |
| 5 | **🏠 Day Scholar System** | Separate meal purchase flow (₹50/meal), hosteller registry auto-sync, QR access enforcement |
| 6 | **🥦 Dietary Filtering** | Veg/Non-Veg/Eggetarian/Jain — client-side filter based on stored preference |
| 7 | **🚀 Production Deployment** | Frontend → Vercel, Backend → Render, DB → MongoDB Atlas, Auto-deploy via GitHub CI/CD |

**Growth:** 7 → 11 models · 10 → 26+ endpoints · 4 → 9 pages · 2 → 7 components

---

## SLIDE 8 — MID-TERM FEEDBACK & HOW WE ADDRESSED IT ⭐

### Feedback Received → Action Taken

| Feedback from Faculty | What We Built |
|---|---|
| **"Implement a Complaint System"** | Built a full complaint module — students submit text + photo proof (Cloudinary), admin gets searchable grid with date filters and inline image previews |
| **"Add a Polling/Voting System"** | Built Reddit-style community polling — upvote/downvote, trending algorithm, category filter, two-step resolution, archive, SVG donut charts |
| **"Day Scholars need a separate flow"** | Created a full Day Scholar payment system — ₹50 meal ticket via Razorpay, separate booking modal, QR scanner enforces paid status, hosteller registry whitelist for auto-classification |

### Additional Improvements Driven by Feedback
- **Deployed to production** — live URL accessible on any device (Vercel + Render)
- **Fixed mobile login** — migrated from popup-based to redirect-based MSAL flow for mobile browser compatibility
- **Added 5-role RBAC** — admin, contractor, accountant, controller, student — each with tailored UI sections
- **Consistent responsive UI** — unified container widths across all 9 pages for seamless navigation

---

## SLIDE 9 — TECHNICAL DEEP-DIVES

### Key Algorithms & Patterns

**1. HMAC-SHA256 Payment Verification**
```
// Server-side (Node.js crypto)
expected = HMAC_SHA256(secret, "orderId|paymentId")
if (expected === razorpay_signature) → PAID ✅
else → FORGED ❌ (rejected)
```
> Same pattern used by Amazon, Flipkart, Stripe. Prevents fake payment callbacks.

**2. Trending Score Algorithm (Polls)**
```
score = net_votes / (age_in_hours + 2) ^ 1.5
```
> A post with 10 votes from 1 hour ago ranks higher than 10 votes from yesterday. The `+2` prevents division-by-zero.

**3. Fuzzy Search with Custom Scoring (Nutrition)**
```
Exact substring match → score 1.0
Character-sequence match → proportional score (0–1)
Results capped at 10 for performance
```
> "aloo" matches "Aloo Paratha" without exact spelling. Used in admin menu management.

**4. Atomic MongoDB Voting**
```javascript
$addToSet: { upvotedBy: userId }   // Add to set (no duplicates)
$pull: { downvotedBy: userId }     // Remove from other set
```
> Ensures a user cannot both upvote AND downvote simultaneously.

---

## SLIDE 10 — DEPLOYMENT ARCHITECTURE

### Production Infrastructure

```
   GitHub Repository
        │
        ├──► Vercel (Frontend)
        │    React SPA, auto-deploy on push
        │    Env: VITE_API_URL, VITE_CLIENT_ID
        │
        └──► Render (Backend)
             Node.js + Express, auto-deploy on push
             Env: MONGO_URI, RAZORPAY_KEYS, CLOUDINARY_*
             TZ=Asia/Kolkata (Indian timezone)
                    │
                    ├──► MongoDB Atlas (Database)
                    ├──► Razorpay (Payments)
                    ├──► Cloudinary (Image CDN)
                    └──► Microsoft Azure AD (Auth)
```

**CI/CD Pipeline:** `git push` → GitHub → auto-build & deploy on both Vercel and Render → live in ~2 minutes.

---

## SLIDE 11 — LIVE DEMO (Walkthrough Plan)

### Demo Flow (if showing live)

1. **Login** — Sign in with @jklu.edu.in via Microsoft popup
2. **Dashboard** — Show QR code, notice banner, today's menu with nutrition
3. **Meal Skip** — Cancel tomorrow's breakfast (show quota remaining)
4. **Non-Veg Booking** — Open Razorpay modal, show tiered pricing
5. **Community Poll** — Create a new issue, upvote, show trending sort
6. **Complaint** — Submit a complaint with photo
7. **Admin Panel** — Switch to admin view, show headcount, ledger CSV export
8. **QR Scan** — Scan the student's QR code (show success/deny logic)
9. **Day Scholar** — Show meal purchase flow (if demo account available)

---

## SLIDE 12 — FUTURE SCOPE & IMPROVEMENTS ⭐

### What Would Make This a True Production System

| Enhancement | Description |
|---|---|
| **🤖 AI Queue Prediction** | ML model trained on historical scan data to predict peak crowd times per meal. Push notification alerts to students: "Lunch queue is high right now — try at 1:15 PM" |
| **☁️ AWS / Cloud Migration** | Move backend from Render to AWS EC2/ECS with auto-scaling. Use S3 or Cloudflare R2 for object storage instead of Cloudinary free tier. Add CloudFront CDN |
| **🔌 Real-Time WebSockets** | Replace polling with Socket.io for live headcount updates, instant scan notifications, and real-time poll vote counters |
| **📱 Progressive Web App (PWA)** | Service worker for offline QR code caching, push notifications for menu updates and notice broadcasts |
| **🔐 JWT + HTTP-Only Cookies** | Replace localStorage-based auth with server-issued JWT tokens in HTTP-only cookies with CSRF protection |
| **🧪 Automated Testing** | Jest unit tests for all controllers, React Testing Library for components, CI pipeline with GitHub Actions |
| **📊 Analytics Dashboard** | Meal consumption trends over weeks/months, most popular dishes, food waste reduction metrics with data visualizations |
| **🍽️ Smart Menu Suggestions** | Recommend menus based on past consumption patterns and nutritional balance using collaborative filtering |
| **💬 Chat Support** | In-app chatbot for FAQs (mess timings, pricing) using Dialogflow or a lightweight rule-based system |
| **🎫 Dynamic QR Codes** | Time-bound rotating QR tokens instead of static MongoDB IDs to prevent screenshot sharing |

---

## SLIDE 13 — TECHNICAL LEARNINGS & KEY TAKEAWAYS ⭐

### What We Learned (Interview-Ready Skills)

**1. Full-Stack Architecture**
> Designed and built a complete three-tier application from scratch — React frontend, Express API, MongoDB database — understanding how each layer communicates via HTTP and how data flows through the entire stack.

**2. OAuth 2.0 & Enterprise SSO**
> Integrated Microsoft Azure Active Directory using MSAL.js. Learned the difference between popup and redirect flows, token handling, and why redirect-based flows are essential for mobile browsers (popup-blockers).

**3. Payment Gateway Integration & Cryptographic Verification**
> Implemented Razorpay's full lifecycle: order creation → checkout → HMAC-SHA256 signature verification. Learned why server-side cryptographic checks are mandatory — a client can send a fake "payment success" response, but it will fail signature verification because only the server knows the secret key.

**4. NoSQL Database Design**
> Designed 11 MongoDB schemas with Mongoose, including compound unique indexes (`{studentId, date, mealType}`) to prevent duplicates at the database level, and atomic operations (`$addToSet`, `$pull`, `findOneAndUpdate` with upsert) to handle race conditions.

**5. Cloud Deployment & DevOps**
> Deployed frontend on Vercel and backend on Render with environment variable management, CORS configuration for cross-origin requests, and timezone configuration (`TZ=Asia/Kolkata`). Learned that `git push` triggers automatic deployments — practical CI/CD.

**6. API Design Patterns**
> Built 26+ RESTful endpoints following consistent `{success, data, message}` response format. Learned the upsert pattern (find-or-create), debouncing for search inputs, and rate-limiting considerations.

**7. Third-Party Service Integration**
> Integrated 4 external services (Azure AD, Razorpay, Cloudinary, QR API) — learning to read API documentation, handle async callbacks, manage API keys securely via environment variables, and deal with service-specific quirks.

**8. Security Thinking**
> Implemented defence-in-depth: domain validation on BOTH frontend AND backend, HMAC verification for payments, compound indexes for data integrity, CORS policies, and role-based access control (5 roles).

---

## SLIDE 14 — CONCLUSION

### What We've Built — Final Numbers

```
11 Database Models     |  26+ API Endpoints    |  9 Frontend Pages
 7 Reusable Components |  6 Backend Controllers|  8 API Route Groups
 
100+ Dishes with Nutritional Data
  2  Payment Types (Non-Veg + Day Scholar)
  5  User Roles (Student, Admin, Contractor, Accountant, Controller)
  4  Third-Party Integrations (Azure AD, Razorpay, Cloudinary, QR API)
```

### The JKLU Mess Management Portal transforms a manual, error-prone cafeteria system into a production-deployed digital platform — eliminating proxy entries, reducing food wastage through advance headcount, enabling transparent refund tracking, and giving students a voice through community polling and complaints.

**Tech Stack:** React + Vite · Node.js + Express · MongoDB Atlas · Azure AD · Razorpay · Cloudinary

**Live:** Deployed on Vercel (frontend) + Render (backend)

---

### Thank You · Questions Welcome

---

## 📝 PRESENTER NOTES

### Slide 7 (Post Mid-Term Work) — Talking Points:
- "After the mid-term, we essentially DOUBLED the size of the project — from 7 to 11 models, from 10 to 26+ endpoints."
- "The Razorpay integration was the most challenging — we had to learn about HMAC cryptographic verification to prevent payment fraud."
- "The polling system uses the same trending algorithm as Reddit and Hacker News."

### Slide 8 (Feedback) — Talking Points:
- "The faculty specifically asked us to add a complaint system and polling system. We went beyond the basic ask — complaints include Cloudinary photo uploads, and polls include a full trending algorithm with SVG data visualization."
- "The Day Scholar feedback led us to rethink the entire access control model — now the QR scanner differentiates between hostellers (free entry) and day scholars (must have paid ticket)."

### Slide 13 (Learnings) — Talking Points:
- "If I had to pick one takeaway for interviews, it would be HMAC-SHA256 payment verification. Every company that handles payments uses this exact pattern."
- "Another key learning: the difference between popup and redirect auth flows. We shipped with popup-based login, it broke on every mobile phone, and we had to migrate to redirect-based. That's a real-world lesson."
