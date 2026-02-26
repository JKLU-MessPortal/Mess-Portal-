import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import Navbar from "../components/Navbar"; // <-- Importing our new Navbar!

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      fetchHistory(parsedUser.id || parsedUser._id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchHistory = async (studentId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/dashboard/history?studentId=${studentId}`);
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f7f6", padding: "30px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Use the new Navbar Component */}
        <Navbar />

        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <h2 style={{ margin: "0 0 20px 0", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px" }}>
            📜 My Cancellation History
          </h2>

          {loading ? (
            <p>Loading records...</p>
          ) : history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
              <p style={{ fontSize: "18px" }}>You haven't skipped any meals yet.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                  <th style={{ padding: "15px", color: "#64748b" }}>Date</th>
                  <th style={{ padding: "15px", color: "#64748b" }}>Meal</th>
                  <th style={{ padding: "15px", color: "#64748b" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const dateStr = new Date(record.date).toLocaleDateString("en-US", { weekday: 'short', month: 'long', day: 'numeric' });
                  return (
                    <tr key={index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "15px", fontWeight: "bold", color: "#334155" }}>{dateStr}</td>
                      <td style={{ padding: "15px" }}>
                        <span style={{ 
                          padding: "5px 10px", borderRadius: "6px", fontSize: "14px", fontWeight: "bold",
                          backgroundColor: "#eff6ff", color: "#3b82f6"
                        }}>
                          {record.mealType}
                        </span>
                      </td>
                      <td style={{ padding: "15px" }}>
                        <span style={{ 
                          color: record.status === "Cancelled" ? "#ef4444" : "#10b981", 
                          fontWeight: "bold" 
                        }}>
                          {record.status === "Cancelled" ? "🚫 Skipped" : "✅ Booked"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}