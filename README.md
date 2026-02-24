🍔 JKLU Mess Management Portal

A full-stack MERN web application that digitizes the JKLU mess entry system using QR-based Digital Mess Pass + Microsoft Azure Authentication.

This project replaces physical ID cards with a secure, real-time QR verification system for students and mess staff.

🌟 Project Overview

This system provides:

• Secure Microsoft login for students
• Auto-generated Digital Mess QR Pass
• Real-time QR scanner for mess staff
• Automatic meal logging in MongoDB
• Duplicate entry prevention
• Time-based meal detection

🚀 Features
🎓 Student Features

Microsoft Outlook Login (Azure AD)

Digital QR Mess Pass

Live Dashboard with profile & meal eligibility

Mobile responsive UI

👨‍🍳 Mess Staff Features

Dedicated QR Scanner page /scan

Real-time QR validation

Automatic meal entry logging

Time-based meal detection

Duplicate entry prevention

🛠️ Tech Stack
Frontend

React.js (Vite)

Material UI

Tailwind CSS

MSAL (Microsoft Authentication)

Axios

QR Scanner Library

Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

CORS + Dotenv

📂 Project Structure
Mess-Portal/
│
├── frontend/            # React Client
│   ├── src/components
│   ├── src/pages
│   ├── authConfig.js
│   └── App.jsx
│
├── server/              # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
│
└── README.md

⚙️ Running Project Locally (FOR TEAM)

This is the MOST IMPORTANT SECTION for your teammates.

1️⃣ Clone Repository
git clone https://github.com/JKLU-MessPortal/Mess-Portal-.git
cd Mess-Portal-

🔐 Environment Variables Setup

Since .env files are private, each developer must create them manually.

Create Backend ENV

Create file:
server/.env

Paste:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

Create Frontend ENV

Create file:
frontend/.env

Paste:

VITE_CLIENT_ID=your_microsoft_azure_client_id
VITE_AUTHORITY=https://login.microsoftonline.com/common
VITE_API_URL=http://localhost:5000

▶️ Run Backend Server
cd server
npm install
npm run dev


Expected output:

Server running on port 5000
MongoDB Connected

💻 Run Frontend App

Open new terminal:

cd frontend
npm install
npm run dev


Open browser:

http://localhost:5173

📱 How To Use
Student Login

Open app

Click Sign in with Outlook

Login using @jklu.edu.in

Mess Scanner

Open:

http://localhost:5173/scan


Allow camera → scan QR.

🔗 API Endpoints
Method	Endpoint	Description
POST	/api/auth/microsoft-login	Azure login
POST	/api/mess/scan	QR verification
GET	/api/auth/users	Get users (dev)
🛡️ Security Features

Only @jklu.edu.in emails allowed

Duplicate meal entry prevention

Backend validation for all scans

No secrets stored in repo

👨‍💻 Development Scripts
Backend
npm run dev
npm start

Frontend
npm run dev
npm run build

🤝 Contributing

Create new branch

git checkout -b feature-name


Commit changes

Create Pull Request

📄 License

MIT License