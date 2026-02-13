import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/"); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  if (!user) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading...</div>;

  // Safe checks for data
  const userName = user.name || "Student";
  const userRole = user.role || "student";
  const userEmail = user.email || "No Email";
  // Fallback to a random string if ID is missing so QR doesn't break
  const userId = user.id || user._id || "NO_ID_FOUND"; 

  // Generate QR Code using a Web API (No library needed!)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userId}`;

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#f3f4f6", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: "20px"
    }}>
      
      {/* --- HEADER --- */}
      <div style={{ 
        width: "100%", 
        maxWidth: "400px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "30px",
        backgroundColor: "white",
        padding: "15px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "#333" }}>Hi, {userName.split(" ")[0]} 👋</h2>
          <span style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", fontWeight: "bold" }}>
            {userRole}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: "#ff4d4f",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      {/* --- DIGITAL ID CARD --- */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "30px", 
        borderRadius: "20px", 
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "320px",
        width: "100%"
      }}>
        <h3 style={{ margin: "0 0 10px 0", color: "#2f2f2f" }}>JKLU MESS PASS</h3>
        <p style={{ color: "#888", fontSize: "14px", margin: "0 0 20px 0" }}>Scan this at the counter</p>

        {/* QR CODE IMAGE (Generated via API) */}
        <div style={{ 
          border: "2px dashed #ddd", 
          padding: "15px", 
          borderRadius: "10px", 
          display: "inline-block",
          marginBottom: "20px"
        }}>
          <img 
            src={qrCodeUrl} 
            alt="Student QR Code" 
            style={{ display: "block", width: "150px", height: "150px" }}
          />
        </div>

        <h2 style={{ fontSize: "20px", margin: "10px 0 5px 0" }}>{userName}</h2>
        <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>{userEmail}</p>

        <div style={{ 
          marginTop: "20px", 
          backgroundColor: "#e6fffa", 
          color: "#047857", 
          padding: "10px", 
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: "bold"
        }}>
          🟢 MEAL STATUS: ELIGIBLE
        </div>
      </div>

    </div>
  );
}