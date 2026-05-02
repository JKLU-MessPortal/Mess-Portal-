import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Get user from context
  const userName = user ? user.name.split(" ")[0] : "Student";
  const userRole = user ? user.role : "student";
  const isStaff = ["admin", "contractor", "accountant"].includes(userRole);

  const handleLogout = () => {
    logout();
  };

  // Helper to check active route
  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      
      {/* LEFT: Logo & Name */}
      <div className="navbar-left">
        <img
          src="/icon.png"
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

      {/* RIGHT: Hamburger Toggle Button (Mobile) */}
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Navigation Links */}
      <div className={`navbar-right ${isMobileMenuOpen ? "open" : ""}`}>
        
        <button
          onClick={() => navigate("/dashboard")}
          className={`nav-btn ${isActive("/dashboard") ? "active" : ""}`}
        >
          🏠 Home
        </button>

        <button
          onClick={() => navigate("/menu")}
          className={`nav-btn ${isActive("/menu") ? "active" : ""}`}
        >
          🍲 Mess Menu
        </button>

        {/* Student-only: History & Settings */}
        {!isStaff && (
          <>
            <button
              onClick={() => navigate("/history")}
              className={`nav-btn ${isActive("/history") ? "active" : ""}`}
            >
              📜 My History
            </button>

            <button
              onClick={() => navigate("/settings")}
              className={`nav-btn ${isActive("/settings") ? "active" : ""}`}
            >
              ⚙️ Settings
            </button>
          </>
        )}

        {/* Polls — Hosteliers + Admin/Staff */}
        {(isStaff || user?.residencyStatus === "Hosteller") && (
          <button
            onClick={() => navigate("/voting")}
            className={`nav-btn ${isActive("/voting") ? "active" : ""}`}
            style={isActive("/voting") ? {} : { color: "#8b5cf6", fontWeight: "bold" }}
          >
            🗳️ Polls
          </button>
        )}

        {/* 🚨 NAYA CODE: SECURE SCANNER BUTTON 🚨 */}
        {(userRole === "admin" || userRole === "contractor") && (
          <button
            onClick={() => navigate("/scanner")}
            className={`nav-btn ${isActive("/scanner") ? "active" : ""}`}
            style={isActive("/scanner") ? {} : { color: "#10b981", fontWeight: "bold" }} // Highlight green when not active
          >
            📷 Scanner
          </button>
        )}

        {/* STAFF BUTTON */}
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

        {/* STUDENT MANAGEMENT – Admin only */}
        {userRole === "admin" && (
          <button
            onClick={() => navigate("/student-management")}
            className={`nav-btn ${isActive("/student-management") ? "active" : ""}`}
          >
            👥 Students
          </button>
        )}


        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}