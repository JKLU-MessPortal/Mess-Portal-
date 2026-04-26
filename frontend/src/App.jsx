import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- IMPORT PAGES ---
import AuthGate from "./pages/AuthGate";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import AdminDashboard from "./pages/AdminDashboard";
import History from "./pages/History";
import Settings from "./pages/Settings";
import StudentManagement from "./pages/StudentManagement";
import Voting from "./pages/Voting";

// --- IMPORT COMPONENTS ---
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<AuthGate />} />

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route 
          path="/scanner" 
          element={
            <PrivateRoute>
              <Scanner />
            </PrivateRoute>
          } 
        />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        
        {/* History Route */}
        <Route path="/history" element={<History />} />

        {/* Settings Route */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        {/* Student Management Route (Admin only) */}
        <Route
          path="/student-management"
          element={
            <PrivateRoute>
              <StudentManagement />
            </PrivateRoute>
          }
        />

        {/* Voting / Polls Route (Hosteliers + Admin) */}
        <Route
          path="/voting"
          element={
            <PrivateRoute>
              <Voting />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;