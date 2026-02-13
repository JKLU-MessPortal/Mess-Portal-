🍔 JKLU Mess Management Portal
🎓 QR Based Digital Mess Pass System
<p align="center"> <img src="https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge"> <img src="https://img.shields.io/badge/Auth-Microsoft%20Azure-blue?style=for-the-badge"> <img src="https://img.shields.io/badge/Database-MongoDB-success?style=for-the-badge"> <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge"> </p>
🌟 Overview

A full-stack MERN web application that digitizes the JKLU mess entry system using a
🔐 Secure QR Code Digital Pass + Microsoft Azure Authentication

This system replaces physical ID cards with a real-time smart mess entry solution.

✨ Key Highlights

🔐 Outlook Login using Microsoft Azure AD

📱 Auto-generated Digital QR Mess Pass

📷 Real-time QR Scanner for Mess Staff

🕒 Automatic Meal Time Detection

🚫 Duplicate Entry Prevention

📊 Live Student Dashboard

👨‍🎓 Student Experience
Feature	Description
🔐 Secure Login	One-click login via JKLU Outlook ID
📲 Digital Mess Card	Unique QR generated per student
📊 Dashboard	Profile + Meal eligibility
📱 Responsive UI	Works on mobile & desktop
👨‍🍳 Mess Staff Experience
Feature	Description
📷 QR Scanner	Dedicated /scan interface
⚡ Real-time Validation	Instant approval/rejection
🍽️ Meal Logging	Auto-stores meal entries
🕒 Time Logic	Detects Breakfast/Lunch/Snacks/Dinner
🛠️ Tech Stack
🎨 Frontend
React (Vite)
Material UI
Tailwind CSS
MSAL Authentication
Axios
QR Scanner

⚙️ Backend
Node.js
Express.js
MongoDB Atlas
Mongoose
CORS
Dotenv

📁 Project Structure
Mess-Portal/
│
├── frontend/  → React Client
├── server/    → Node Backend
└── README.md

⚙️ Local Setup Guide (Team Setup)
📥 1. Clone Repo
git clone https://github.com/JKLU-MessPortal/Mess-Portal-.git
cd Mess-Portal-

🔐 Environment Setup

⚠️ .env files are NOT included for security.

Each developer must create them manually.

🖥️ Backend ENV → server/.env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret

🌐 Frontend ENV → frontend/.env
VITE_CLIENT_ID=your_azure_client_id
VITE_AUTHORITY=https://login.microsoftonline.com/common
VITE_API_URL=http://localhost:5000

▶️ Run Backend
cd server
npm install
npm run dev


Expected:

🚀 Server running on port 5000
✅ MongoDB Connected

💻 Run Frontend

Open new terminal:

cd frontend
npm install
npm run dev


Open:

http://localhost:5173

📱 How To Use
🔐 Student Login

Open app

Click Sign in with Outlook

Use @jklu.edu.in

📷 Mess Scanner

Open:

http://localhost:5173/scan


Allow camera → Scan QR → Done ✅

🔗 API Endpoints
Method	Endpoint	Description
POST	/api/auth/microsoft-login	Azure login
POST	/api/mess/scan	Verify QR
GET	/api/auth/users	Dev testing
🛡️ Security

✔ Domain restriction
✔ Duplicate scan prevention
✔ Backend validation
✔ Secrets hidden via .env

🤝 Contributing
git checkout -b feature-name
git commit -m "feature added"
git push origin feature-name


Create Pull Request 🚀

📜 License

MIT License

✨ Built with ❤️ by JKLU Students
