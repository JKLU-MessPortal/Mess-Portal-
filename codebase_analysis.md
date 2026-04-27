# JKLU Mess Management Portal — Full Codebase Analysis

## Overview
This is a **full-stack MERN** (MongoDB, Express.js, React, Node.js) web application for digitizing and managing the mess/cafeteria system at JK Lakshmipat University. Since the mid-term report, the project has grown **significantly** — from 5 route groups to 8, from 7 models to 11, and from 5 pages to 9.

---

## What's NEW Since Mid-Term Report

### New Backend Models (4 new)
| Model | File | Purpose |
|---|---|---|
| **Complaint** | `Complaint.js` | Student complaints with text + image (replaces old Review model). Has text index on `studentName` and date-sorted index for fast queries |
| **NonVegBooking** | `NonVegBooking.js` | Paid non-veg meal bookings — stores Razorpay payment details (orderId, paymentId, signature), price (₹30 egg / ₹120 chicken), status (pending/paid/failed) |
| **Nutrition** | `Nutrition.js` | Per-dish nutritional data — calories, protein, carbs, fat, fibre, free sugar, serving unit. Supports 100+ dishes from `mess_nutrition.json` |
| **PollPost** | `PollPost.js` | Reddit-style issue/poll posts — with upvote/downvote arrays, category tags (Food Quality, Hygiene, Service, Timing, Cleanliness), two-step resolution (admin marks fixed → student confirms) |

### New Backend Models (Modified)
| Model | Changes |
|---|---|
| **User** | Added fields: `isBlocked`, `dietaryPreference` (Veg/Non-Veg/Eggetarian/Jain), `residencyStatus` (Hosteller/Day-Scholar), `foodAllergies`, `controller` role |
| **Menu** | Added `nonVegItems` array field — separate from veg items |
| **HostellerRegistry** | NEW — Whitelist of hosteller emails. Auto-sets residency on login |

### New Backend Controllers (3 new)
| Controller | Functions | Key Concepts |
|---|---|---|
| **paymentController** | `createOrder`, `verifyPayment`, `getBookingStatus`, `mockSuccess` | **Razorpay payment integration** — HMAC-SHA256 signature verification, paise conversion, idempotent duplicate prevention, dev-mode mock payments |
| **pollController** | `getPosts`, `createPost`, `vote`, `adminResolve`, `studentResolve`, `deletePost` | **Reddit-style voting** — `$addToSet`/`$pull` atomic operations, trending score algorithm (net votes / age^1.5), two-step resolution workflow |
| **adminController** (expanded) | `getAllStudents`, `toggleBlockStatus`, `getHostellers`, `registerHosteller`, `deregisterHosteller`, `updateUserRole` | **Student management** — block/unblock, hosteller registry CRUD, role management with `strict: false` for legacy data |

### Modified Backend Controllers
| Controller | Changes |
|---|---|
| **authController** | Added `getSettings`, `updateSettings`. Login now auto-detects Hosteller/Day-Scholar via `HostellerRegistry` lookup |
| **messController** | Now checks `isBlocked` field before allowing scan |

### New Backend Routes (3 new)
| Route Group | Endpoints |
|---|---|
| `/api/complaints` | `POST /` (submit with Multer image upload, 8MB limit), `GET /` (admin search + date filtering) |
| `/api/nutrition` | `GET /` (all records), `GET /search?q=...` (fuzzy search with custom scoring), `GET /lookup?name=...`, `POST /` (admin: add custom dish) |
| `/api/payment` | `POST /create-order`, `POST /verify`, `GET /status`, `POST /mock-success` |
| `/api/polls` | `GET /`, `POST /`, `POST /:id/vote`, `PUT /:id/admin-resolve`, `PUT /:id/student-resolve`, `DELETE /:id` |

### New Frontend Routes (4 new)
| Route | Page | Description |
|---|---|---|
| `/menu` | `MenuPage.jsx` | Full weekly menu with day-selector tabs. Today: colourful tile grid + blur-modal popup. Other days: expandable accordion cards. Nutrition info per dish |
| `/settings` | `Settings.jsx` | Student profile page — read-only fields (name from OAuth, roll number, residency from admin) + editable dietary preference & food allergies |
| `/voting` | `Voting.jsx` | Reddit-style issue board — create posts (Hostellers only), upvote/downvote, sort (recent/trending/top), category filter, debounced search, detail panel with SVG donut chart, two-step resolution, archive tab |
| `/student-management` | `StudentManagement.jsx` | Admin page for managing students — block/unblock, role changes |

### New Frontend Components (2 new)
| Component | Purpose |
|---|---|
| **NonVegBookingModal** | Full Razorpay checkout flow — dynamic pricing (₹30 egg / ₹120 chicken), Razorpay script loading, order creation, payment verification, mock test mode, success/error states |
| **DishSearchInput** | Fuzzy dish search with dropdown autocomplete + custom dish creation form. Saves new dishes to Nutrition DB. Used in admin menu management |

### Major UI/UX Enhancements
- **Dashboard redesigned**: Today/Tomorrow menus now show colourful gradient tiles (Breakfast=orange, Lunch=amber, Snacks=green, Dinner=indigo) instead of listing all dishes
- **Blur modal popup**: Click a meal tile → animated modal slides up with blurred backdrop, showing dishes + nutrition
- **Complaint box**: Inline form on dashboard with image upload
- **Dietary filtering**: Menu pages filter non-veg items based on student's preference (Vegetarian hides all non-veg, Eggetarian shows only egg items)

---

## Key Technical Concepts Applied

### 1. Authentication & Authorization
- **Microsoft Azure AD SSO** via MSAL.js (OAuth 2.0 popup flow)
- **Domain-restricted login** (`@jklu.edu.in` enforcement on both frontend and backend)
- **Role-Based Access Control (RBAC)**: 5 roles — `student`, `admin`, `contractor`, `accountant`, `controller`
- **Hosteller Registry pattern**: Whitelist-based auto-detection of Hosteller vs Day-Scholar on every login

### 2. Payment Integration
- **Razorpay payment gateway** with full order lifecycle:
  - Frontend dynamically loads Razorpay checkout script
  - Backend creates Razorpay orders with amount in paise
  - **HMAC-SHA256 signature verification** for payment authenticity
  - Idempotent booking with duplicate detection
  - Mock/simulate payment route for testing without real gateway

### 3. Database Design Patterns
- **Upsert pattern** (`findOneAndUpdate` with `upsert: true`) for menus, hosteller registry, nutrition data, user creation
- **Compound unique indexes** on MealBooking `{studentId, date, mealType}` for data integrity
- **Text indexes** on Complaint model for fast search
- **Dual tracking**: `MealLog` (actual scans) vs `MealBooking` (planned skip/book) — kept independent
- **11 Mongoose models** total with proper schema validation and enums

### 4. Real-Time Analytics
- **Kitchen headcount**: Counts tomorrow's cancellations per meal type, cross-referenced with total hosteller count
- **Refund ledger**: Aggregates all cancelled meals per student with user identity resolution
- **Voting analytics**: SVG donut chart with net vote scores, trending algorithm

### 5. Advanced Frontend Patterns
- **Blur modal with backdrop-filter**: CSS `backdrop-filter: blur(10px)` with spring animations (`cubic-bezier(.34,1.56,.64,1)`)
- **Debounced search**: 280-300ms delay before API calls (used in dish search, poll search)
- **Fuzzy search algorithm**: Custom JS scoring function on backend — substring match gets top score, then character-by-character matching
- **Dietary preference filtering**: Client-side filter hides non-veg items for Vegetarian/Jain users, shows only egg items for Eggetarians
- **Conditional rendering by role + residency**: Different UI for Hostellers vs Day-Scholars, different admin sections by role

### 6. File Upload & Static Serving
- **Multer middleware** for complaint images (8MB limit)
- Express static directory serving from `/uploads`

### 7. API Design
- **8 RESTful route groups** under `/api/`
- Consistent JSON response format (`{ success: boolean, data, message }`)
- Proper HTTP status codes (200, 201, 400, 403, 404, 500)

---

## Complete File Inventory

### Backend (server/)
- **Entry**: `index.js` — Express server, CORS, MongoDB Atlas connection, 8 route groups
- **Models** (11): User, MealLog, Menu, MealBooking, Booking, Complaint, NonVegBooking, Nutrition, PollPost, Notice, HostellerRegistry
- **Controllers** (6): authController, messController, dashboardController, adminController, paymentController, pollController
- **Routes** (8): auth, mess, dashboard, admin, complaints, nutrition, payment, polls
- **Scripts**: `seedMenu.js`, `fixRole.js`

### Frontend (frontend/src/)
- **Entry**: `main.jsx` (MSAL provider), `App.jsx` (9 routes)
- **Pages** (9): AuthGate, Dashboard, MenuPage, Scanner, AdminDashboard, History, Settings, StudentManagement, Voting
- **Components** (4): Navbar, PrivateRoute, NonVegBookingModal, DishSearchInput
- **CSS** (9 page-level stylesheets + 2 component stylesheets)

---

## Architecture Summary

```
┌─────────────────────────────┐         ┌─────────────────────────────┐
│   React Frontend (Vite)     │  Axios  │   Express Backend (Node)    │
│   Port 5173                 │◄───────►│   Port 5000                 │
│                             │         │                             │
│ • MSAL (Azure AD SSO)       │         │ • 8 REST API Route Groups   │
│ • 9 Pages                   │         │ • 6 Controllers             │
│ • Razorpay Checkout         │         │ • 11 Mongoose Models        │
│ • Blur Modal UI             │         │ • Multer File Upload        │
│ • Dietary Filtering         │         │ • Razorpay Integration      │
└─────────────────────────────┘         └──────────┬──────────────────┘
                                                   │
                                        ┌──────────▼──────────────────┐
                                        │   MongoDB Atlas (Cloud)     │
                                        │   11 Collections            │
                                        │   + Compound Indexes        │
                                        └─────────────────────────────┘
                                                   │
                                        ┌──────────▼──────────────────┐
                                        │   Razorpay Payment Gateway  │
                                        │   HMAC-SHA256 Verification  │
                                        └─────────────────────────────┘
```

---

> **Ready for report editing.** Please share your LaTeX report and I'll update it with all the content above — covering everything built since mid-term.
