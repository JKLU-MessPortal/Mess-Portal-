# 🍔 JKLU Mess Management Portal

A full-stack web application designed to digitize the mess entry system at JKLU. This project replaces physical ID cards with a secure **QR Code–based Digital Pass**, integrating **Microsoft Azure Authentication** for students and a **real-time QR scanner** for mess staff.

---

## 🚀 Features

### 🎓 For Students
- **Secure Login:** One-click authentication using **JKLU Outlook ID** (Microsoft Azure AD)
- **Digital Mess Card:** Auto-generates a unique QR Code based on the student’s database ID
- **Live Dashboard:** Displays student profile, roll number, and meal eligibility status
- **Responsive Design:** Works seamlessly on mobile and desktop devices

### 👨‍🍳 For Mess Staff
- **Built-in QR Scanner:** Dedicated scanning interface available at `/scan`
- **Real-time Validation:** Instantly verifies student validity and meal status
- **Meal Logging:** Automatically records entries (Breakfast, Lunch, Snacks, Dinner) in MongoDB
- **Time-Based Logic:** Automatically detects the current meal based on system time

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Material UI (MUI)
- Tailwind CSS
- MSAL (Microsoft Authentication Library)
- `@yudiel/react-qr-scanner`
- Axios

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- CORS
- Dotenv

---

## ⚙️ Installation & Setup

Follow the steps below to run the project locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/JKLU-MessPortal/JKLU-Mess-Portal
cd mess-management-portal
2️⃣ Backend Setup (Run the Server)
Open a terminal and navigate to the backend folder:

cd server
npm install
Create .env file in server/
PORT=5000
MONGO_URI=your_mongodb_connection_string
Start the backend server
node index.js
✅ Expected output:

🚀 Server is running on Port 5000
✅ MongoDB Connected
3️⃣ Frontend Setup (Run the Client)
Open a new terminal (keep backend running):

cd frontend
npm install
Create .env file in frontend/
VITE_CLIENT_ID=your_microsoft_azure_client_id
VITE_AUTHORITY=https://login.microsoftonline.com/common
Start the React app
npm run dev
🌐 Open your browser and visit:

http://localhost:3000
📱 Usage Guide
🔐 Student Login
Open http://localhost:3000

Click Sign in with Outlook

Use a valid @jklu.edu.in email ID

📊 Dashboard
View your Digital QR Pass

See profile details and meal eligibility

📷 Mess Staff Scanning
Navigate to http://localhost:3000/scan

Allow camera permissions

Scan the student’s QR code

Scan Results
✅ Green Check: Entry approved

❌ Red Cross: Duplicate entry or invalid QR

📂 Project Structure
mess-management-portal/
│
├── frontend/               # React Client
│   ├── src/
│   │   ├── components/     # Reusable UI Components
│   │   ├── pages/          # Login, Dashboard, Scanner
│   │   ├── authConfig.js   # MSAL Configuration
│   │   └── App.jsx         # Routing Logic
│   └── ...
│
├── server/                 # Node.js Backend
│   ├── controllers/        # Auth & Scan Logic
│   ├── models/             # Mongoose Models (User, MealLog)
│   ├── routes/             # API Routes
│   └── index.js            # Server Entry Point
│
└── README.md               # Documentation
🔗 API Endpoints
Method	Endpoint	Description
POST	/api/auth/microsoft-login	Authenticate user via Microsoft Azure
POST	/api/mess/scan	Verify QR & log meal entry
GET	/api/auth/users	Fetch all users (Dev only)
🛡️ Security Features
Domain Restriction: Only @jklu.edu.in emails are allowed

Duplicate Prevention: Students cannot scan twice for the same meal on the same day

Server-side Validation: All checks handled securely in backend

🤝 Contributing
Contributions are welcome!
Fork the repository, create a feature branch, and submit a pull request.

📄 License
This project is licensed under the MIT License.

MIT License