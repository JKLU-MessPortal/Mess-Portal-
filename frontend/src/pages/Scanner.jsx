import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Naya import navigation ke liye
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import "./Scanner.css";

const MessScanner = () => {
  const navigate = useNavigate(); // 👈 Hook initialize kiya

  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("Ready to Scan");

  // 🚨 NAYA CODE: SECURITY GUARD (Role Check) 🚨
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Agar role admin ya contractor NAHI hai, toh bahar nikal do
      if (parsedUser.role !== "admin" && parsedUser.role !== "contractor") {
        alert("🚨 Access Denied: Authorized Staff Only!");
        navigate("/dashboard"); // Student ko wapas uske dashboard bhej do
      }
    } else {
      navigate("/"); // Agar login hi nahi hai, toh login page par bhejo
    }
  }, [navigate]);

  const handleScan = async (detectedCodes) => {
    if (status === "loading" || status === "success" || status === "error") return;

    // The library returns an array of detected codes
    const rawValue = detectedCodes[0]?.rawValue;

    if (rawValue) {
      console.log("Scanned ID:", rawValue);
      setStatus("loading");
      setMessage("Verifying Student...");

      try {
        // Send to Backend
        const res = await axios.post("http://localhost:5000/api/mess/scan", {
          studentId: rawValue,
        });

        if (res.data.success) {
          setStatus("success");
          setMessage(`✅ Allowed: ${res.data.studentName}`);
          
          // Reset after 3 seconds for the next student
          setTimeout(resetScanner, 3000);
        }

      } catch (error) {
        console.error("Scan Error:", error);
        setStatus("error");
        
        // Handle specific backend errors
        if (error.response) {
            setMessage(error.response.data.message || "Scan Failed");
        } else {
            setMessage("Network Error. Check Server.");
        }
      }
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus("idle");
    setMessage("Ready to Scan");
  };

  return (
    <div className="scanner-page">
      <h1 className="scanner-title">JKLU Mess Scanner</h1>

      {/* --- CAMERA WINDOW --- */}
      <div className="scanner-window">
        {status === "idle" && (
          <Scanner
            onScan={handleScan}
            components={{ audio: false, torch: true }}
            styles={{ container: { width: "100%", height: "100%" } }}
          />
        )}

        {/* --- OVERLAYS FOR SUCCESS / ERROR --- */}
        {status === "success" && (
          <div className="scanner-overlay-success">
            <CheckCircle size={80} className="scanner-icon" />
            <h2 className="scanner-overlay-text">{message}</h2>
          </div>
        )}

        {status === "error" && (
          <div className="scanner-overlay-error">
            <XCircle size={80} className="scanner-icon" />
            <h2 className="scanner-overlay-text">{message}</h2>
            <button onClick={resetScanner} className="scanner-retry-btn">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* --- STATUS TEXT --- */}
      <div className="scanner-status-box">
        <p className={`scanner-status-text ${status === "loading" ? "scanner-status-loading" : ""}`}>
          {message}
        </p>
      </div>

      <p className="scanner-hint">Ensure good lighting. Keep QR code steady.</p>
    </div>
  );
};

export default MessScanner;