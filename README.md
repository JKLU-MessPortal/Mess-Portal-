# 🍔 JKLU Mess Management Portal

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) web application designed to digitize and manage the mess/cafeteria system at JKLU. This project replaces physical ID cards with a secure **QR Code–based Digital Pass**, integrates **Microsoft Azure Authentication**, features a robust **Razorpay payment gateway** for meal bookings, and includes advanced interactive features like a **Reddit-style voting system**, **menu & nutrition tracking**, and **complaint management**.

---

## 🚀 Key Features

### 🎓 For Students
- **Secure Login:** One-click authentication using **JKLU Outlook ID** (Microsoft Azure AD) with domain-restriction (`@jklu.edu.in`).
- **Digital Mess Card:** Auto-generates a unique QR Code based on the student's database ID.
- **Advanced Menu System:** View weekly menus with colourful gradient tiles, blur-modal popups, and per-dish nutrition info. Filter meals based on dietary preferences (Vegetarian/Non-Veg/Eggetarian/Jain).
- **Non-Veg Bookings:** Full Razorpay checkout flow for dynamic meal pricing (₹30 egg / ₹120 chicken).
- **Issue Voting Board:** Reddit-style poll/issue board to upvote/downvote issues, sorted by trending algorithms with a two-step resolution workflow.
- **Complaint Management:** Submit complaints with image uploads (Multer) directly from the dashboard.

### 👨‍🍳 For Mess Staff & Admin
- **Built-in QR Scanner:** Dedicated scanning interface with real-time validation and blocking checks.
- **Role-Based Access Control (RBAC):** Supports 5 roles (`student`, `admin`, `contractor`, `accountant`, `controller`).
- **Student Management:** Block/unblock students, manage Hosteller vs Day-Scholar registries, and update roles.
- **Kitchen Headcount & Analytics:** Real-time headcount based on bookings and cancellations, with refund ledger tracking.
- **Menu & Dish Management:** Fuzzy search autocomplete and custom dish creation saved to the Nutrition DB.

---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** React.js (Vite)
- **UI & Styling:** Tailwind CSS, Material UI (MUI), Custom CSS animations (blur modals)
- **Auth:** MSAL (Microsoft Authentication Library)
- **QR:** `@yudiel/react-qr-scanner`
- **Other:** Axios, Razorpay Checkout JS

### Backend
- **Core:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose (11 models with compound/text indexes)
- **Uploads:** Multer (8MB image upload limit)
- **Security:** HMAC-SHA256 (Razorpay verification), CORS, Dotenv

### Architecture Patterns
- **Dual Tracking:** Separates actual scans (`MealLog`) from planned bookings (`MealBooking`).
- **Hosteller Registry:** Whitelist-based auto-detection of residency status on login.
- **Upsert Pattern & Fuzzy Search:** Advanced MongoDB queries and custom scoring algorithms for dish search.

---

## ⚙️ Installation & Setup

Follow the steps below to run the project locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/JKLU-MessPortal/JKLU-Mess-Portal
cd mess-management-portal
```

### 2️⃣ Backend Setup (Run the Server)
Open a terminal and navigate to the backend folder:

```bash
cd server
npm install
```

Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

Start the backend server:
```bash
node index.js
```
✅ Expected output:
```
🚀 Server is running on Port 5000
✅ MongoDB Connected
```

### 3️⃣ Frontend Setup (Run the Client)
Open a new terminal (keep backend running):

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_CLIENT_ID=your_microsoft_azure_client_id
VITE_AUTHORITY=https://login.microsoftonline.com/common
```

Start the React app:
```bash
npm run dev
```
🌐 Open your browser and visit: `http://localhost:5173` *(Note: Vite default port is 5173)*

---

## 📂 Project Structure

```
mess-management-portal/
│
├── frontend/               # React Client (Vite)
│   ├── src/
│   │   ├── components/     # Navbar, NonVegBookingModal, DishSearchInput
│   │   ├── pages/          # 9 Pages (Dashboard, MenuPage, Scanner, Voting, Settings, etc.)
│   │   ├── App.jsx         # Routing Logic for 9 routes
│   └── ...
│
├── server/                 # Node.js Backend
│   ├── controllers/        # 6 Controllers (Auth, Mess, Payment, Poll, Admin, Dashboard)
│   ├── models/             # 11 Mongoose Models (User, Complaint, Nutrition, PollPost, etc.)
│   ├── routes/             # 8 API Route Groups
│   └── index.js            # Server Entry Point
│
└── README.md               # Documentation
```

---

## 🔗 API Endpoints

- **Auth:** `/api/auth` - Microsoft login, settings updates.
- **Mess:** `/api/mess` - QR scanning & meal logging.
- **Menu/Dashboard:** `/api/dashboard` - Menus, stats.
- **Admin:** `/api/admin` - Student management, hosteller registry.
- **Complaints:** `/api/complaints` - Image uploads and history.
- **Nutrition:** `/api/nutrition` - Fuzzy search & dictionary.
- **Payment:** `/api/payment` - Razorpay order creation, verification, mock success.
- **Polls:** `/api/polls` - Upvote/downvote, issue resolution.

---

## 🛡️ Security & Integrity Features

- **Domain Restriction:** Only `@jklu.edu.in` emails are allowed.
- **Duplicate Prevention:** Students cannot scan twice; compound unique indexes prevent double booking.
- **Payment Verification:** HMAC-SHA256 signature verification for all Razorpay transactions.
- **Data Integrity:** Strict input validation and RBAC checks for all endpoints.

---

## 🤝 Contributing
Contributions are welcome!
Fork the repository, create a feature branch, and submit a pull request.

## 📄 License
This project is licensed under the MIT License.