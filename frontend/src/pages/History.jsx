import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./History.css";

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
    <div className="history-page">
      <div className="history-wrapper">

        <Navbar />

        <div className="history-card">
          <h2>📜 My Cancellation History</h2>

          {loading ? (
            <p>Loading records...</p>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <p>You haven't skipped any meals yet.</p>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Meal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record, index) => {
                  const dateStr = new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
                  return (
                    <tr key={index}>
                      <td className="history-date">{dateStr}</td>
                      <td>
                        <span className="meal-badge">{record.mealType}</span>
                      </td>
                      <td>
                        <span className={record.status === "Cancelled" ? "status-cancelled" : "status-booked"}>
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