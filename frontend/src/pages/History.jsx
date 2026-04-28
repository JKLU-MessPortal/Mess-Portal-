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

  const getMealIcon = (meal) => {
    switch (meal?.toLowerCase()) {
      case 'breakfast': return '🍳';
      case 'lunch': return '🍛';
      case 'snacks': return '🥪';
      case 'dinner': return '🍽️';
      default: return '🍱';
    }
  };

  return (
    <div className="history-page">
      <div className="history-wrapper">

        <Navbar />

        <div className="history-card">
          <div className="history-header">
            <div className="history-icon-wrapper">
              <span className="history-header-icon">📜</span>
            </div>
            <div>
              <h2 className="history-title">My Meal History</h2>
              <p className="history-subtitle">Track your past meal bookings and cancellations</p>
            </div>
          </div>

          {loading ? (
            <div className="history-loading">
              <div className="spinner"></div>
              <p>Loading your history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon">🍽️</div>
              <h3>No history yet</h3>
              <p>You haven't skipped or booked any past meals.</p>
            </div>
          ) : (
            <div className="history-table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Meal Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, index) => {
                    const dateStr = new Date(record.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
                    const mealClass = record.mealType ? record.mealType.toLowerCase() : "default";
                    const statusClass = record.status === "Cancelled" ? "cancelled" : "booked";
                    
                    return (
                      <tr key={index} className="history-row">
                        <td className="history-date">
                          <span className="date-icon">📅</span>
                          {dateStr}
                        </td>
                        <td>
                          <span className={`meal-badge meal-badge--${mealClass}`}>
                            <span className="meal-icon">{getMealIcon(record.mealType)}</span>
                            {record.mealType}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-badge--${statusClass}`}>
                            <span className="status-dot"></span>
                            {record.status === "Cancelled" ? "Skipped" : "Booked"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}