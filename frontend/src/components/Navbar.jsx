import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user from local storage
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user ? user.name.split(" ")[0] : "Student";
  const userRole = user ? user.role : "student";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Helper to make buttons look active if we are on that page
  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ 
      backgroundColor: "white", 
      padding: "15px 30px", 
      borderRadius: "16px", 
      marginBottom: "30px", 
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center"
    }}>
      {/* LEFT: Logo & Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyOyKn5i71GaoKjTcL3sBWriHa_NRPQio_Mw&s" 
          alt="Logo" 
          style={{ width: "40px", height: "40px", objectFit: "contain" }} 
        />
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#1e293b" }}>Hello, {userName} 👋</h2>
          <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>
            {userRole} Portal
          </span>
        </div>
      </div>

      {/* RIGHT: Navigation Links */}
      <div style={{ display: "flex", gap: "10px" }}>
        
        {/* Dashboard Link */}
        <button 
          onClick={() => navigate("/dashboard")}
          style={{
            backgroundColor: isActive("/dashboard") ? "#e2e8f0" : "transparent",
            color: "#334155",
            border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
          }}
        >
          🏠 Home
        </button>

        {/* History Link (NEW!) */}
        <button 
          onClick={() => navigate("/history")}
          style={{
            backgroundColor: isActive("/history") ? "#e2e8f0" : "transparent",
            color: "#334155",
            border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
          }}
        >
          📜 My History
        </button>

        {/* Staff Portal (Conditional) */}
        {(userRole === "admin" || userRole === "contractor" || userRole === "accountant") && (
          <button 
            onClick={() => navigate("/admin")}
            style={{
              backgroundColor: isActive("/admin") ? "#dbeafe" : "transparent",
              color: "#2563eb",
              border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "600"
            }}
          >
            ⚙️ Staff
          </button>
        )}

        {/* Logout */}
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: "#fee2e2", color: "#dc2626",
            border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}