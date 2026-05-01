Institute of Engineering and Technology (IET)
JK Lakshmipat University, Jaipur
Minor Project Final Report
Mess Management Portal
PREPARED BY
Aman Singh (2023BTech006)
Anjisht Amritanshu (2023BTech009)
Ayush Choudhary (2023BTECH020)
FACULTY GUIDE
Dr. Deepika Prakash
Assistant Professor | Computer Science and Engineering
April 2026
MessManagementPortal MinorProjectFinalReport
Contents
1 Abstract 4
2 Introduction 4
3 ProblemStatement 5
4 MethodologyandTheoreticalBackground 6
4.1 DevelopmentMethodology . . . . . . . . . . . . . . . . . . . . . . . . . . 6
4.2 TheoreticalBackground . . . . . . . . . . . . . . . . . . . . . . . . . . . 6
4.2.1 QRCode-BasedAuthentication . . . . . . . . . . . . . . . . . . . 6
4.2.2 OAuth2.0andMicrosoftAzureADSSO. . . . . . . . . . . . . . 7
4.2.3 RESTfulAPIDesign . . . . . . . . . . . . . . . . . . . . . . . . . 7
4.2.4 Time-BasedMealDetection . . . . . . . . . . . . . . . . . . . . . 7
4.2.5 MonthlyQuota-BasedMealSkipSystem . . . . . . . . . . . . . . 7
4.2.6 RazorpayPaymentGatewayIntegration . . . . . . . . . . . . . . 8
4.2.7 Nutritional InformationSystem . . . . . . . . . . . . . . . . . . . 8
4.2.8 CommunityIssuePollingSystem . . . . . . . . . . . . . . . . . . 8
4.2.9 DietaryPreferenceFiltering . . . . . . . . . . . . . . . . . . . . . 9
4.2.10MealPricingandRebateSystem . . . . . . . . . . . . . . . . . . 9
4.2.11 FoodItemExclusion . . . . . . . . . . . . . . . . . . . . . . . . . 9
4.2.12 ReviewandRatingSystem. . . . . . . . . . . . . . . . . . . . . . 9
4.2.13 GlassmorphismUIwithBlur-Modal Interactions . . . . . . . . . . 10
5 ArchitectureandKeyDesignDecisions 10
5.1 High-LevelSystemDesign . . . . . . . . . . . . . . . . . . . . . . . . . . 10
5.2 TechStack. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 10
5.3 AdditionalDesignDecisions . . . . . . . . . . . . . . . . . . . . . . . . . 10
6 WorkCompleted 13
6.1 ResearchandDesign . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 13
6.2 Backend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 14
6.2.1 ServerSetup(server/index.js) . . . . . . . . . . . . . . . . . . 14
6.2.2 DatabaseModels(server/models/) . . . . . . . . . . . . . . . . 14
6.2.3 Controllers(server/controllers/) . . . . . . . . . . . . . . . . 15
6.2.4 Routes(server/routes/) . . . . . . . . . . . . . . . . . . . . . . 18
6.2.5 DatabaseSeederandUtilityScripts . . . . . . . . . . . . . . . . . 18
6.3 Frontend. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19
6.3.1 ApplicationSetup. . . . . . . . . . . . . . . . . . . . . . . . . . . 19
1
MessManagementPortal MinorProjectFinalReport
6.3.2 ReusableComponents . . . . . . . . . . . . . . . . . . . . . . . . 19
6.3.3 Pages . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 19
6.4 UI/UXDesign. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 21
7 RisksandMitigationStrategies 22
8 Conclusion 23
9 Appendix 24
2
Mess Management Portal
Minor Project Final Report
List of Tables
1
2
3
4
Technology Stack Summary . . . . . . . . . . . . . . . . . . . . . . . . . 12
Database Models (11 Collections) . . . . . . . . . . . . . . . . . . . . . . 15
Complete API Route Summary (8 Groups, 26+ Endpoints) . . . . . . . . 18
Risk Assessment and Mitigation . . . . . . . . . . . . . . . . . . . . . . . 23
3
Mess Management Portal
Minor Project Final Report
1 Abstract
The JKLU Mess Management Portal is a comprehensive full-stack web application de
signed to digitize and streamline the cafeteria (mess) entry and meal management system
at JK Lakshmipat University. The existing physical ID card-based entry system was
prone to inefficiencies such as long queues, proxy entries, and lack of real-time tracking
and meal wastage data. This project replaces the traditional system with a QR code
based digital mess pass, enabling students to carry a digital identity, mess staff to scan
and verify entries in real time, and administrators to monitor headcount, manage menus,
track meal cancellations, and issue notices.
The portal is built using the MERN stack (MongoDB, Express.js, React, Node.js),
with Microsoft Azure AD for authentication via institutional email IDs. The system
supports three user roles — Hostel students, Day Scholar students and mess staff (ad
ministrators) — each with tailored interfaces and role-based access control (RBAC).
Key features include QR-based meal verification with time-based meal detection, a
meal skip/booking system with monthly quotas and automated rebate calculation, real
time kitchen headcount analytics, a refund ledger with CSV export, per-dish nutritional
information with an expandable database of over 100 dishes, Razorpay-integrated non
vegetarian meal booking with HMAC-SHA256 payment verification, dietary preference
f
iltering (Vegetarian, Non-Vegetarian, Eggetarian, and Jain Food), a Reddit-style com
munity issue polling and resolution system with upvote/downvote mechanics and trending
algorithms, food item exclusion for advance meal customisation, a meal pricing display
engine, a complaint module with photographic evidence upload, a review and star-rating
system for each meal, and a premium glassmorphism UI with blur-modal interactions
and micro-animations.
The final deliverable encompasses eleven Mongoose database models, six backend
controllers, eight RESTful API route groups, nine frontend page components, and four
reusable UI components — constituting a production-ready, scalable web application.
2 Introduction
University mess management is a critical aspect of campus life that directly impacts
student satisfaction and institutional operational efficiency. At JK Lakshmipat University
(JKLU), the mess serves hundreds of students daily across four meal slots — Breakfast,
Lunch, Snacks, and Dinner. The current system relies on physical ID cards for entry
verification, manual headcount tracking, and paper-based or informal feedback collection.
This project, the Mess Management Portal, aims to modernize this process by
building a comprehensive web-based platform that serves three key stakeholders:
4
Mess Management Portal
Minor Project Final Report
1. Students: Receive a digital QR code-based mess pass, view daily and weekly
menus, skip or book meals with a monthly quota system, view meal history, pay
for additional dishes and submit food reviews with photo evidence.
2. Mess Staff: Use a built-in QR scanner to verify student entries in real time, with
automatic duplicate detection and time-based meal-type resolution.
3. Administrators: Manage weekly menus, view tomorrow’s headcount for kitchen
planning, generate refund ledgers for cancelled meals, broadcast notices, and review
student feedback.
The portal leverages Microsoft Azure Active Directory single sign-on (SSO) for au
thentication, ensuring that only students with valid @jklu.edu.in email addresses can
access the system. The application is built on the MERN stack, combining a React
frontend (bootstrapped with Vite) with a Node.js/Express backend and MongoDB At
las as the cloud database. Additionally, the system integrates Razorpay as a payment
gateway for non-vegetarian meal bookings and implements a comprehensive nutritional
information database for dietary awareness.
This report documents the complete project, including system architecture, database
design, API development, frontend implementation, testing, and the final feature set
delivered.
3 Problem Statement
The existing mess management system at JKLU suffers from several operational and
administrative challenges:
1. Inefficient Entry Verification: Physical ID cards are manually checked at the
mess entrance, leading to long queues during peak meal hours and the possibility
of proxy entries.
2. No Real-Time Tracking: There is no digital record of which students have eaten
which meals on a given day. This makes it impossible to generate accurate meal
consumption reports or detect anomalies.
3. Food Wastage: Without advance knowledge of how many students plan to eat,
the kitchen prepares food based on rough estimates, often resulting in significant
food wastage or shortages.
4. Lack of Meal Flexibility: Students have no mechanism to skip a meal in advance
or track how many meals they have opted out of in a month, hindering any potential
refund or credit system.
5
Mess Management Portal
Minor Project Final Report
5. No Feedback Channel: There is no structured way for students to rate meals,
report food quality issues, or attach photographic evidence of problems, making it
difficult for administrators to identify and address recurring issues.
6. Administrative Overhead: Menu updates, headcount tracking, refund calcula
tions, and notice distribution are handled manually or through informal channels,
consuming valuable administrative time and introducing errors.
The Mess Management Portal addresses all of these problems through a unified digital
platform that automates entry verification via QR codes, provides real-time meal logging,
supports advance meal booking and cancellation with enforced quotas, offers kitchen
headcount analytics, and includes a comprehensive review and feedback system.
4 Methodology and Theoretical Background
4.1 Development Methodology
The project follows an Agile development methodology with iterative sprints. The
development is divided into the following phases:
1. Requirements Gathering and Analysis: Identifying stakeholder needs through
discussions with mess administration and students.
2. System Design: Designing the database schema, API architecture, authentication
f
low, and UI wireframes.
3. Implementation: Incremental development of backend APIs first, followed by
frontend integration.
4. Testing: Unit testing of individual API endpoints, integration testing of the full
authentication and scanning flow.
5. Deployment and Feedback: Deploying the application and gathering user feed
back for iterative improvement.
4.2 Theoretical Background
4.2.1 QR Code-Based Authentication
QR (Quick Response) codes are two-dimensional barcodes capable of encoding arbitrary
data. In this project, each student’s unique MongoDB ObjectId is encoded into a QR
code, which serves as their digital mess pass. The QR code is generated client-side using
an external API (api.qrserver.com) and is displayed on the student’s dashboard. Mess
6
Mess Management Portal
Minor Project Final Report
staff scan this QR code using the device camera via the @yudiel/react-qr-scanner
library, and the decoded student ID is sent to the backend for verification.
4.2.2 OAuth 2.0 and Microsoft Azure AD SSO
The system uses Microsoft Azure Active Directory (Azure AD) for authentication via the
OAuth 2.0 authorization code flow. The Microsoft Authentication Library (MSAL) for
JavaScript handles the popup-based login flow on the frontend. Only email addresses
matching the @jklu.edu.in domain are accepted, enforced on both the frontend and
backend. Upon successful authentication, the user’s profile is upserted into MongoDB,
and the session is maintained via localStorage.
4.2.3 RESTful API Design
Thebackend follows REST (Representational State Transfer) principles. Resources (users,
meals, bookings, menus, nutrition records, complaints, polls, and notices) are exposed
through clearly defined HTTP endpoints organised by domain (/api/auth, /api/mess,
/api/dashboard, /api/admin, /api/complaints, /api/nutrition, /api/payment, /api/polls).
Standard HTTP methods (GET, POST, PUT, DELETE) are used for CRUD operations,
and responses follow a consistent JSON format ({success, data, message}).
4.2.4 Time-Based Meal Detection
Instead of requiring the mess staff to manually select a meal type during scanning, the
system automatically determines the current meal based on the server clock:
• 08:00– 09:30 → Breakfast
• 12:00– 14:00 → Lunch
• 17:00– 18:00 → Snacks
• 20:00– 22:00 → Dinner
• Outside these windows → Mess is closed
This eliminates manual selection errors and ensures accurate meal logging.
4.2.5 Monthly Quota-Based Meal Skip System
Students can skip meals in advance (for the next day). To prevent abuse, the system
enforces monthly skip quotas per meal type:
• Breakfast: 5 skips/month
7
Mess Management Portal
Minor Project Final Report
• Lunch: 5 skips/month
• Snacks: 10 skips/month
• Dinner: 5 skips/month
Quota enforcement is performed server-side to prevent client-side manipulation. The
remaining quota is displayed on the student dashboard. Meals that are skipped contribute
to a monthly rebate ledger, which is accessible by the accountant role for processing
refunds.
4.2.6 Razorpay Payment Gateway Integration
For non-vegetarian meals that carry an additional charge and meal charge for day scholar
students, the system integrates the Razorpay payment gateway. The payment flow follows
a three-step process:
1. Order Creation: The backend creates a Razorpay order with the amount in paise
(smallest currency unit) and returns the order ID to the frontend.
2. Checkout: The frontend dynamically loads the Razorpay checkout script and
opens the payment modal with pre-filled student details.
3. Verification: Upon payment completion, the backend verifies the payment au
thenticity using HMAC-SHA256 signature verification — computing a hash
of orderId|paymentId using the secret key and comparing it against Razorpay’s
signature.
This ensures that payment confirmations cannot be forged by malicious clients.
4.2.7 Nutritional Information System
The system maintains a dedicated Nutrition collection containing per-dish nutritional
data (calories, protein, carbohydrates, fat, dietary fibre, and free sugar) for over 100 com
monly served mess dishes. Nutritional data is displayed alongside each dish in expandable
panels with animated progress bars. The admin interface includes a fuzzy search engine
with a custom scoring algorithm that ranks results by substring match quality, enabling
efficient dish lookup even with partial or misspelled queries.
4.2.8 Community Issue Polling System
The polling module implements a Reddit-style post system where hostellers can raise
mess-related issues (food quality, hygiene, service, timing, cleanliness). Each post sup
ports upvote/downvote mechanics using MongoDB’s $addToSet and $pull atomic oper
ators. Posts can be sorted by three algorithms:
8
Mess Management Portal
Minor Project Final Report
• Recent: Chronological order by creation timestamp.
• Top: Net vote score (upvotes minus downvotes).
• Trending: A decay-weighted score computed as netvotes
(age in hours+2)1.5 
, which surfaces
recently popular posts.
Resolution follows a two-step workflow: the admin marks the issue as fixed, then the
original poster confirms the resolution, after which the post is archived.
4.2.9 Dietary Preference Filtering
Students can configure their dietary preference (Vegetarian, Non-Vegetarian, Eggetarian,
or Strict-Vegetarian/Jain Food) in their profile settings. The menu pages apply client-side
f
iltering to hide or show items accordingly:
• Vegetarian / Jain: All non-veg items are hidden.
• Eggetarian: Only egg-based items (matched via keyword detection) are shown
from the non-veg section.
• Non-Vegetarian: All items are visible.
4.2.10 Meal Pricing and Rebate System
Each meal type carries a predefined cost displayed on the student dashboard. Non
vegetarian items have tiered pricing: egg-based items at Rs.30 and chicken-based items
at Rs.120 per serving, for now. The rebate system automatically tracks all cancelled
meals per student per month. The refund ledger, accessible to accountants, aggregates
these cancellations and cross-references them with user identity data, enabling accurate
monthly refund processing with CSV export capability.
4.2.11 Food Item Exclusion
Students can exclude specific unwanted food items from their meal in advance. When
viewing tomorrow’s menu, students can deselect individual items they do not wish to
receive. This information is stored in the MealBooking collection and relayed to the
kitchen via the admin headcount analytics dashboard, enabling more precise food prepa
ration quantities and reducing wastage.
4.2.12 Review and Rating System
Students can submit reviews and star ratings (1–5 scale) for each meal they have con
sumed. Reviews can include text comments and photographic evidence uploaded via the
9
Mess Management Portal
Minor Project Final Report
FormData API and processed by Multer middleware. The admin and contractor roles can
view all reviews in a filterable grid, enabling data-driven improvements to food quality
and service.
4.2.13 Glassmorphism UI with Blur-Modal Interactions
The frontend employs modern UI patterns including glassmorphism (frosted-glass effects
using CSS backdrop-filter: blur()), gradient-based colour-coded meal tiles, spring
physics animations (cubic-bezier(.34,1.56,.64,1)), and micro-interactions (hover
lifts, scale transforms, pulsing indicators). Modals use a blurred backdrop overlay with
slide-up entry animations, creating a premium, app-like user experience.
5 Architecture and Key Design Decisions
5.1 High-Level System Design
The application follows a standard three-tier architecture:
• Presentation Layer (Frontend): A React application bootstrapped with Vite,
communicating with the backend via Axios HTTP calls. Uses MSAL.js for Microsoft
Azure AD SSO and vanilla CSS3 (glassmorphism, CSS Grid, Flexbox) for styling.
• Application Layer (Backend): A Node.js server using Express 5 framework.
Handles authentication, business logic (meal scanning, booking, quota enforce
ment), and data access through Mongoose ODM.
• Data Layer (Database): MongoDB Atlas (cloud-hosted NoSQL database) stores
all application data — users, meal logs, bookings, menus, complaints, nutrition
records, poll posts, and notices.
5.2 Tech Stack
5.3 Additional Design Decisions
1. Domain-Restricted Authentication: Both frontend and backend validate that
the user’s email ends with @jklu.edu.in. The backend returns HTTP 403 for
non-university emails, preventing unauthorized access.
2. Upsert Pattern for User Management: The microsoftLogin controller uses
a find-or-create (upsert) pattern. If a student logs in for the first time, a new user
record is created; subsequent logins update the existing record. This eliminates the
need for a separate registration flow.
10
Mess Management Portal
Minor Project Final Report
Figure 1: Architecture
11
Mess Management Portal
Minor Project Final Report
Layer
Technologies
Frontend
React 18 (Vite), React Router v6, MSAL.js, Axios, @yudiel/react
qr-scanner, lucide-react, CSS3 (Glassmorphism, backdrop-filter,
CSS Grid, Flexbox)
Backend
Node.js, Express 5, Mongoose ODM, CORS, Multer (file uploads),
dotenv, crypto (HMAC-SHA256), Razorpay SDK
Database
MongoDB Atlas (cloud-hosted NoSQL) — 11 collections with
compound indexes
Authentication
Microsoft Azure Active Directory (OAuth 2.0 popup flow via
MSAL.js)
Payment Gateway Razorpay (order creation, checkout, HMAC-SHA256 signature
verification)
Hosting/DevOps
Vite dev server (frontend), Node.js (backend), MongoDB Atlas
(database)
Table 1: Technology Stack Summary
3. Hosteller Registry Whitelist: A dedicated HostellerRegistry collection acts
as the source of truth for hostel residency. On every login, the system cross
references the student’s email against this registry and automatically sets their
residencyStatus to Hosteller or Day-Scholar. This ensures residency changes
made by the admin take immediate effect without requiring students to update
their profile.
4. Dual Meal Tracking Models: The system maintains two separate collections:
• MealLog — Records real-time scan entries (what students actually ate).
• MealBooking — Records advance booking/cancellation decisions (what stu
dents plan to eat tomorrow).
This separation ensures that planned and actual consumption data remain inde
pendently queryable.
5. CompoundUnique Index on MealBooking: TheMealBookingcollectionhasa
unique compound index on {studentId, date, mealType}, preventing duplicate
booking entries at the database level.
6. HMAC-SHA256 Payment Verification: Non-vegetarian meal payments are
verified using cryptographic signature verification. The backend computes HMAC-SHA256(orderId|paymentId,
secret) and compares it against Razorpay’s signature, ensuring payment integrity.
7. Client-Side QR Generation: QR codes are generated using an external API
(api.qrserver.com) rather than server-side rendering. This reduces backend load
and simplifies the architecture, as the student’s MongoDB _id is a stable, unique
identifier.
12
Mess Management Portal
Minor Project Final Report
8. Role-Based Access Control (RBAC): Thesystem supports five distinct roles —
student, admin, contractor, accountant, and controller — each with tailored
UI rendering:
• admin, contractor → Kitchen Controls, Menu Management, Reviews, and
Poll Resolution
• admin, accountant → Refund Ledger and Financial Analytics
• admin → Student Management, Hosteller Registry, Role Assignment, Notice
Broadcast
9. Fuzzy Search with Custom Scoring: The nutrition API implements a cus
tom fuzzy matching algorithm that scores candidates based on character-sequence
matching. Substring matches receive maximum score; partial matches are scored
proportionally. Results are capped at 10 for performance.
10. Debounced API Calls: All search inputs across the application (dish search,
poll search) implement 280–300ms debouncing to minimise unnecessary API calls
during rapid typing.
11. Static File Serving for Uploads: Complaint and review images uploaded via
Multer are stored in the uploads/ directory, which is served as a static directory
by Express. This avoids the complexity of a dedicated file storage service for the
current scale.
6 Work Completed
6.1 Research and Design
• Conducted a requirements analysis with mess administration and students to iden
tify key pain points (long queues, proxy entry, food wastage, lack of feedback).
• Evaluated authentication options and selected Microsoft Azure AD SSO due to
JKLU’s existing Microsoft 365 infrastructure.
• Designed the database schema with eleven Mongoose models spanning user man
agement, meal tracking, menu configuration, payments, nutrition, polling, and com
plaints.
• Defined the REST API contract with eight route groups covering authentication,
scanning, dashboard, administration, complaints, nutrition, payments, and polls.
• Designed UI wireframes for all nine application pages, incorporating modern design
patterns such as glassmorphism, gradient-coded tiles, and blur-modal interactions.
13
Mess Management Portal
Minor Project Final Report
• Selected the MERN stack based on team expertise and the requirement for a real
time, responsive single-page application.
• Evaluated payment gateway options and selected Razorpay for non-vegetarian meal
bookings due to its comprehensive Node.js SDK and test mode support.
6.2 Backend
The complete backend has been implemented with the following components:
6.2.1 Server Setup (server/index.js)
• Express server with CORS configured for the React frontend at localhost:5173.
• JSON body parsing via express.json().
• Static file serving from uploads/ for complaint and review photos.
• MongoDB Atlas connection using MONGO_URI from environment variables.
• Eight route groups mounted under /api/: auth, mess, dashboard, admin, polls,
nutrition, complaints, and payment.
6.2.2 Database Models (server/models/)
Eleven Mongoose models have been implemented:
14
MessManagementPortal MinorProjectFinalReport
Model Purpose
User Student/adminprofiles—name,email,rollNumber,role(5roles),
dietaryPreference, residencyStatus, foodAllergies, isBlocked
MealLog Real-timescanentries—studentId,mealType, scannedAttimes
tamp
Menu Weeklymenu—dayOfWeek,mealType,vegitemsarray,nonVeg
Itemsarray
MealBooking Advancemealskip/bookdecisionswithcompounduniqueindexon
{studentId,date,mealType}
Booking Extendedbookingmodelwithfooditemexclusionsupport
NonVegBooking Paidnon-vegorders—Razorpayfields (orderId,paymentId, sig
nature), tieredpricing,status(pending/paid/failed)
Nutrition Per-dishnutritionaldata(calories,protein,carbs, fat,fibre,sugar)
for100+dishes
PollPost Community issue postswithupvote/downvote arrays, category
tags, two-stepresolution
Complaint Studentcomplaintswithtext, image, text indexonstudentName,
dateindex
HostellerRegistry Hosteller emailwhitelistwithcascadingUsermodel updates on
login
Notice Adminbroadcastnotices—messageanddate
Table2:DatabaseModels(11Collections)
6.2.3 Controllers(server/controllers/)
AuthenticationController(authController.js):
•microsoftLogin:Receives{name,email,rollNumber}fromthefrontend.Validates
the@jklu.edu.indomain(rejectswithHTTP403otherwise). Uses theupsert
patterntofindor create theuser inMongoDB.Auto-detectsHosteller orDay
Scholar statusviaHostellerRegistry lookuponevery login. Returns theuser
objectwithid,name,email, role, residencyStatus,anddietaryPreference.
•getSettings /updateSettings:Fetchesandupdatesastudent’seditableprofile
fields—dietarypreferenceandfoodallergies—persistedtoMongoDBandreturned
tothefrontendforlocalStoragesynchronisation.
MessController(messController.js):
•scanQRCode:Coreentryverification.Validatesstudentexistenceandblockstatus.
15
Mess Management Portal
Minor Project Final Report
Determines meal type via server clock. Checks duplicate entries. Creates a MealLog
entry on success.
Dashboard Controller (dashboardController.js):
• getDashboardData: Fetches today’s and tomorrow’s menus (veg and non-veg), the
full weekly menu, monthly skip statistics with remaining quotas, meal pricing, and
tomorrow’s existing bookings.
• toggleMeal: Handles meal skip/un-skip with server-side quota enforcement. Uses
findOneAndUpdate with upsert: true.
• getStudentHistory: Returns all meal booking records for a student, sorted by
most recent first.
Admin Controller (adminController.js) — 10 functions:
• updateMenu: Upserts veg and non-veg menu items for a given day and meal type.
• getHeadcount: Counts tomorrow’s cancellations per meal type, cross-referenced
with total hosteller count.
• getRefundLedger: Aggregates cancelled meals per student with user identity res
olution for rebate processing.
• updateNotice / getNotice: CRUD for broadcast notices.
• getAllStudents / toggleBlockStatus: Studentmanagementwithblock/unblock
functionality.
• getHostellers / registerHosteller / deregisterHosteller: Full CRUD for
the Hosteller Registry whitelist with cascading User model updates.
• updateUserRole: Role assignment with validation against five valid roles.
Payment Controller (paymentController.js):
• createOrder: Creates Razorpay orders with tiered pricing (egg: Rs.30, chicken:
Rs.120). Prevents duplicate bookings. Saves pending NonVegBooking.
• verifyPayment: HMAC-SHA256 signature verification using Node.js crypto mod
ule. Marks booking as paid or failed.
• getBookingStatus: Retrieves paid non-veg bookings for a student on a given date.
• mockSuccess: Development-only endpoint for testing without the Razorpay gate
way.
16
Mess Management Portal
Minor Project Final Report
Poll Controller (pollController.js):
• getPosts: Fetches active or resolved posts with category filter, regex search, and
three sort algorithms (recent, top, trending with decay-weighted scoring).
• createPost: Hosteller-only post creation with category tagging.
• vote: Atomic upvote/downvote using $addToSet and $pull.
• adminResolve / studentResolve: Two-step resolution workflow.
• deletePost: Creator-only deletion.
17
Mess Management Portal
Minor Project Final Report
6.2.4 Routes (server/routes/)
Route Group Method & Endpoint
authRoutes
POST /api/auth/microsoft-login
GET/PUT /api/auth/settings
Purpose
Microsoft SSO lo
gin
Student settings
messRoutes
POST /api/mess/scan
QR scan verifica
tion
dashboardRoutes GET /api/dashboard/data
POST /api/dashboard/toggle
GET /api/dashboard/history
Dashboard data
Toggle meal skip
Meal history
adminRoutes
POST /api/admin/menu
GET /api/admin/headcount
GET /api/admin/ledger
POST/GET /api/admin/notice
Update menu
Headcount ana
lytics
Refund ledger
Notices
GET/POST/DELETE /api/admin/hostellers Hosteller registry
POST /api/admin/update-role
Role management
complaintRoutes POST /api/complaints
GET /api/complaints
Submit complaint
Search complaints
nutritionRoutes
GET /api/nutrition
GET /api/nutrition/search
POST /api/nutrition
All nutrition data
Fuzzy search
Add custom dish
paymentRoutes
POST /api/payment/create-order
POST /api/payment/verify
GET /api/payment/status
Razorpay order
Verify payment
Booking status
pollRoutes
GET/POST /api/polls
POST /api/polls/:id/vote
PUT /api/polls/:id/*-resolve
List/create posts
Vote on post
Resolution
Table 3: Complete API Route Summary (8 Groups, 26+ Endpoints)
6.2.5 Database Seeder and Utility Scripts
• seedMenu.js: Populates MongoDB with sample weekly menu data including veg
and non-veg items.
• fixRole.js: Administrative script for correcting user role inconsistencies.
• mess_nutrition.json: Seed data containing nutritional information for 100+ In
dian mess dishes.
18
Mess Management Portal
Minor Project Final Report
6.3 Frontend
The complete frontend has been implemented with nine page components and four
reusable components:
6.3.1 Application Setup
• main.jsx: Creates an MSAL instance using Azure AD credentials from envi
ronment variables (VITE_CLIENT_ID, VITE_AUTHORITY). Wraps the entire app in
<MsalProvider>.
• App.jsx: Defines React Router with nine protected routes — / (AuthGate),
/dashboard, /menu, /scanner, /admin, /history, /settings, /student-management,
and /voting.
6.3.2 Reusable Components
• PrivateRoute.jsx: Auth guard that checks localStorage and redirects unau
thenticated users.
• Navbar.jsx: Responsive navigation bar with role-based links (Home, Menu, His
tory, Settings, Staff Panel, Voting), user name display, and logout.
• NonVegBookingModal.jsx: Full Razorpay checkout flow — dynamically loads
the Razorpay script, displays tiered pricing, handles payment lifecycle (details, pay
ing, success, error), and includes a mock payment mode for development.
• DishSearchInput.jsx: Fuzzy search autocomplete with debounced API calls (280ms),
tag-based selection, and an inline custom dish creation form for adding new dishes
to the Nutrition database.
6.3.3 Pages
AuthGate.jsx — Login Page:
• Full-screen background with JKLU mess imagery and glassmorphism login card.
• Microsoft SSO popup login via MSAL.
• Frontend email domain validation (@jklu.edu.in).
• Stores user session (including role, residencyStatus, dietaryPreference) in localStorage.
Dashboard.jsx — Student Dashboard:
• Animated notice banner with shimmer animation and pulsing badge.
19
Mess Management Portal
Minor Project Final Report
• Digital Mess Pass (ID card) with QR code and gradient-bordered hover glow effect.
• Monthly skip statistics showing remaining quota per meal type with meal pricing
display.
• Today’s and tomorrow’s menus as colour-coded gradient meal tiles with click-to
expand blur-modal popups showing dish lists and nutritional information.
• Tomorrow’s menu with skip/book toggles, food item exclusion, and non-veg pur
chase via Razorpay modal.
• Complaint submission form with text input and optional photo upload.
• Review and star-rating form for each meal with photo evidence upload.
• Full weekly menu grid with day-wise expandable cards.
MenuPage.jsx — Dedicated Menu Page:
• Day-selector tabs for browsing the full weekly menu.
• Today’s menu as four vibrant gradient tiles in a responsive grid.
• Click-to-expand blur-backdrop modal with per-dish nutritional information in ex
pandable panels with animated progress bars.
• Dietary preference filtering (Vegetarian/Eggetarian/Jain hides or shows non-veg
items accordingly).
Scanner.jsx — Mess Staff QR Scanner:
• Camera-based QR code scanning using @yudiel/react-qr-scanner.
• Validates student existence, block status, and duplicate entries.
• Visual feedback: green checkmark on success, red X on failure. Auto-reset after 3
seconds.
AdminDashboard.jsx — Staff Portal:
• Sidebar navigation with role-gated sections:– Kitchen Controls(admin, contractor): Menu management with DishSearchInput
fuzzy autocomplete for veg/non-veg items. Live headcount analytics with total
hosteller count.– Refund Ledger (admin, accountant): Accordion view of per-student can
celled meals with CSV export for rebate processing.
20
Mess Management Portal
Minor Project Final Report– Complaints (admin, contractor): Searchable complaint grid with date filter
ing and photo evidence.– Notice Broadcast (admin): Campus-wide mess announcements.– Hosteller Registry (admin): Register/deregister hostellers with cascading
updates.– Role Management (admin): Assign any of five roles to users.
Settings.jsx — Student Profile:
• Three-section card layout: Personal Information (read-only from OAuth), Resi
dency & Diet (editable dietary preference with visual chips), Food Allergies (free
text).
• Dietary changes immediately update menu filtering via localStorage synchroni
sation.
Voting.jsx — Community Issue Polling:
• Reddit-style two-panel layout with inline vote buttons and detail panel with SVG
donut chart.
• Sort tabs (Recent, Trending, Top), category filter chips, debounced search (300ms).
• Active/Archive toggle with two-step resolution workflow.
• Hosteller-only post creation with category tagging.
StudentManagement.jsx — Admin Student Management:
• Searchable student list with block/unblock toggles and role assignment dropdowns.
History.jsx — Cancellation History:
• Tabular display of past meal cancellations with date, meal type, and status.
6.4 UI/UX Design
The frontend employs a cohesive, premium design system built with vanilla CSS3:
• Glassmorphism: Frosted-glass effects using backdrop-filter: blur(10px) saturate(1.4)
for modal backdrops.
• Gradient Meal Tiles: Colour-coded interactive tiles with distinct gradients per
meal type, glow orbs, and spring-physics hover animations (cubic-bezier(.34,1.56,.64,1)).
21
MessManagementPortal MinorProjectFinalReport
•Micro-Animations: Shimmereffects, pulsingbadges, bell ringanimations, and
smoothmodalslide-upentry(@keyframes modalSlideUp).
•ResponsiveDesign: CSSGridandFlexboxwithmediaqueries for480pxand
768pxbreakpoints.
•WarmAccentTheme: Amber/orangepalette, card-based layoutswithsubtle
shadows,andclearvisualhierarchy.
•SVGDataVisualisation: Customdonutcharts inthepollingsystemrendered
viainlineSVGwithcomputedstroke-dasharrayvalues.
7 RisksandMitigationStrategies
S.No. Risk MitigationApplied
1 QRCode Sharing/Fraud: Stu
dentsmaysharescreenshotsoftheir
QRcodewithothersforproxyentry.
Implemented server-side duplicate
detectionpreventing the sameQR
frombeing scanned twice for the
samemealonthesameday. Added
studentblock/unblockfunctionality
foradministrativeenforcement.
2 NetworkDependency: TheQR
scanner requires anactive internet
connection.Networkoutagesatthe
messentrancewouldblockentries.
TheQRcode is generated client
sideandcachedinthestudentdash
board. Amanual student IDentry
fallbackisavailableinthemessstaff
interface.
3 Camera/DeviceCompatibility:
Theweb-basedQRscannermaynot
workreliablyacrossalldevicesand
browsers.
Tested across multiple de
vices and browsers. The
@yudiel/react-qr-scanner li
braryprovides broadcompatibility
withgracefuldegradation.
4 Payment Security: Non
vegetarianmeal payments couldbe
forgedormanipulated.
ImplementedHMAC-SHA256cryp
tographic signature verification for
all Razorpay payments. Payment
status is verified server-side before
confirming bookings. Idempotent
duplicatepreventionatthedatabase
level.
22
MessManagementPortal MinorProjectFinalReport
S.No. Risk MitigationApplied
5 DataConsistency: Race condi
tionsduringconcurrentmealtoggles
or scans could leadtoduplicateor
inconsistentrecords.
Leveraged MongoDB’s atomic
findOneAndUpdate operations
and unique compound indexes on
{studentId,date,mealType} to
prevent duplicates at thedatabase
level.
6 Scalability:Astheuserbasegrows,
the current architecturemay face
performancebottlenecks.
Added database indexes on fre
quently queried fields (text index
onComplaint,date-sortedindexes).
ImplementedAPI responsecapping
(fuzzy search limited to 10 re
sults). Architecture supportshori
zontalscaling.
7 Unauthorized Access: Users
mightattempttoaccessadmin-only
features.
Implemented five-roleRBAC (stu
dent, admin, contractor, accoun
tant, controller)withbothfrontend
conditional rendering andbackend
rolevalidation.PrivateRouteguards
protectallauthenticatedpages.
Table4:RiskAssessmentandMitigation
8 Conclusion
TheJKLUMessManagementPortalhasbeensuccessfullydevelopedasacomprehensive,
production-readywebapplicationthataddressesall identifiedpainpointsintheexisting
messmanagementsystem.Theprojectdeliversacompletedigital transformationofthe
messentry,menumanagement,andfeedbackecosystematJKLakshmipatUniversity.
Thekeyaccomplishmentsofthisproject include:
1.DigitalEntryVerification:Replacedphysical IDcardcheckingwithQRcode
basedscanning,eliminatingproxyentriesandenablingreal-timemeal loggingwith
time-basedmealdetection.
2.AdvanceMealManagement: Implementedaquota-basedmeal skip/booking
systemwith food itemexclusion, enabling students to customise theirmeals in
advancewhileprovidingthekitchenwithaccurateheadcountdatatoreducefood
wastage.
23
Mess Management Portal
Minor Project Final Report
3. Payment Integration: Integrated Razorpay payment gateway for non-vegetarian
meal bookings with HMAC-SHA256 cryptographic verification, supporting tiered
pricing for egg and chicken items.
4. Nutritional Awareness: Built a comprehensive database of 100+ dishes with
detailed nutritional information (calories, protein, carbohydrates, fat, fibre, sugar),
accessible via fuzzy search and displayed alongside every menu item.
5. Community Feedback: Developed a Reddit-style polling system with upvote/
downvote mechanics, trending algorithms, and a two-step resolution workflow, giv
ing students a structured voice in mess improvement.
6. Administrative Tools: Provided mess administrators with kitchen headcount
analytics, refund ledger with CSV export, hosteller registry management, student
block/unblock controls, role management, complaint tracking, and notice broad
casting capabilities.
7. Premium User Experience: Delivered a modern, responsive UI featuring glass
morphism, gradient-coded meal tiles, blur-modal interactions, micro-animations,
and dietary preference-aware filtering — creating an engaging, app-like experience.
The final system comprises eleven database models, six backend controllers, eight
RESTful API route groups with over 26 endpoints, nine frontend page components, and
four reusable UI components — built on the MERN stack with Microsoft Azure AD SSO
and Razorpay payment integration. The application demonstrates the practical appli
cation of modern web development concepts including OAuth 2.0 authentication, cryp
tographic payment verification, NoSQL database design with compound indexes, atomic
database operations, RESTful API architecture, and responsive CSS3 design patterns.
9 Appendix
A.1: Project Screenshots
The following figures illustrate key screens of the JKLU Mess Management Portal.
24
Mess Management Portal
Minor Project Final Report
Figure 2: Login Interface
Figure 3: Student Dashboard — QR Code Mess Pass and Meal Overview
25
Mess Management Portal
Minor Project Final Report
Figure 4: Poll Voting System
A.2: References
1. MongoDB Documentation. MongoDB Manual. https://www.mongodb.com/docs/
manual/
2. Express.js. Express– Node.js Web Application Framework. https://expressjs.
com/
3. React. React Documentation. https://react.dev/
4. Microsoft Identity Platform. Microsoft Authentication Library (MSAL) for JavaScript.
https://learn.microsoft.com/en-us/entra/identity-platform/msal-overview
5. Mongoose ODM.Mongoose v8.x Documentation. https://mongoosejs.com/docs/
6. Vite. Vite– Next Generation Frontend Tooling. https://vitejs.dev/
7. Razorpay. Razorpay Payment Gateway Documentation. https://razorpay.com/
docs/
8. QR Server API. QR Code Generator API. https://goqr.me/api/
9. @yudiel/react-qr-scanner. React QR Scanner Component. https://www.npmjs.
com/package/@yudiel/react-qr-scanner
10. OAuth 2.0 Authorization Framework. RFC 6749. https://datatracker.ietf.
org/doc/html/rfc6749
26
Mess Management Portal
Minor Project Final Report
11. Fielding, R.T. (2000). Architectural Styles and the Design of Network-based Soft
ware Architectures. Doctoral dissertation, University of California, Irvine.
12. Multer. Node.js Middleware for Handling multipart/form-data. https://www.
npmjs.com/package/multer
13. Node.js Crypto Module. Node.js Crypto Documentation. https://nodejs.org/
api/crypto.html
14. CSS Backdrop Filter. MDN Web Docs — backdrop-filter. https://developer.
mozilla.org/en-US/docs/Web/CSS/backdrop-filter
27