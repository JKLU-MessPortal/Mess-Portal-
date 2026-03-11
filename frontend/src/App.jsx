import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- IMPORT PAGES ---
import AuthGate from "./pages/AuthGate";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import AdminDashboard from "./pages/AdminDashboard";
import History from "./pages/History";

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

        {/* 🚨 SECURE: Staff Scanner Route 🚨 */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;