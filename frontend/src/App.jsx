import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";

// --- IMPORT PAGES ---
import AuthGate from "./pages/AuthGate";
import Dashboard from "./pages/Dashboard";
import Scanner from "./pages/Scanner";
import AdminDashboard from "./pages/AdminDashboard";

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

        {/* Staff Scanner Route */}
        <Route path="/scan" element={<Scanner />} />

        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;