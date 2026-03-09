import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

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

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      
      {/* LEFT: Logo & Name */}
      <div className="navbar-left">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyOyKn5i71GaoKjTcL3sBWriHa_NRPQio_Mw&s"
          alt="Logo"
          className="navbar-logo border"
        />
        <div>
          <h2 className="navbar-title">Hello, {userName}</h2>
          <span className="navbar-role">
            {userRole} Portal
          </span>
        </div>
      </div>

      {/* RIGHT: Navigation Links */}
      <div className="navbar-right">
        
        <button
          onClick={() => navigate("/dashboard")}
          className={`nav-btn ${isActive("/dashboard") ? "active" : ""}`}
        >
          🏠 Home
        </button>

        <button
          onClick={() => navigate("/history")}
          className={`nav-btn ${isActive("/history") ? "active" : ""}`}
        >
          📜 My History
        </button>

        {(userRole === "admin" ||
          userRole === "contractor" ||
          userRole === "accountant") && (
          <button
            onClick={() => navigate("/admin")}
            className={`nav-btn staff-btn ${
              isActive("/admin") ? "active-staff" : ""
            }`}
          >
            ⚙️ Staff
          </button>
        )}

        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}