import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");
  // --- NAYE STATES: Review System Ke Liye ---
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [reviewMsg, setReviewMsg] = useState("");
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg("Submitting...");

    const formData = new FormData();
    formData.append("studentId", user.id || user._id);
    formData.append("studentName", user.name);
    formData.append("rating", rating);
    formData.append("comment", comment);

    if (image) {
      formData.append("foodImage", image); // Backend multer ka naam match hona chahiye
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/reviews/submit",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.success) {
        setReviewMsg(" Thank you! Your feedback has been sent to the Admin.");
        setComment("");
        setRating(5);
        setImage(null);
        // Box ko wapas khali karne ke liye file input ko reset karna
        document.getElementById("imageUploadInput").value = "";
      }
    } catch (error) {
      console.error("Review Error:", error);
      setReviewMsg(" Failed to submit review. Please try again.");
    }
  };

  const [menuData, setMenuData] = useState({
    todayMenu: [],
    tomorrowMenu: [],
    fullMenu: [],
    todayName: "Today",
    tomorrowName: "Tomorrow",
    skipStats: null,
    tomorrowBookings: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchMenu(parsedUser.id || parsedUser._id);

      // ✅ Notice Fetch Karne ka code ab andar aa gaya
      axios
        .get("http://localhost:5000/api/admin/notice")
        .then((res) => {
          if (res.data.notice && res.data.notice.message) {
            setNotice(res.data.notice.message);
          }
        })
        .catch((err) => console.log("Notice Error:", err));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchMenu = async (studentId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/data?studentId=${studentId}`,
      );
      if (res.data.success) {
        setMenuData({
          todayMenu: res.data.todayMenu,
          tomorrowMenu: res.data.tomorrowMenu,
          fullMenu: res.data.fullMenu || [],
          todayName: res.data.todayName,
          tomorrowName: res.data.tomorrowName,
          skipStats: res.data.skipStats,
          tomorrowBookings: res.data.tomorrowBookings,
        });
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    }
  };

  const handleToggleMeal = async (mealType, currentStatus) => {
    const newStatus = currentStatus === "Cancelled" ? "Booked" : "Cancelled";
    const studentId = user.id || user._id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/dashboard/toggle",
        {
          studentId: studentId,
          date: tomorrow,
          mealType: mealType,
          status: newStatus,
        },
      );

      if (res.data.success) {
        alert(res.data.message);
        fetchMenu(studentId);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert( + error.response.data.message);
      } else {
        alert("An error occurred.");
      }
    }
  };

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px" }}>
        Loading Portal...
      </div>
    );

  const userName = user.name || "Student";
  const userEmail = user.email || "No Email";
  const userId = user.id || user._id || "NO_ID_FOUND";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userId}`;
  const allDaysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <Navbar />

        {/* --- BROADCAST NOTICE BANNER --- */}
        {notice && (
          <div className="notice-banner">
            <span className="notice-banner-icon"></span>
            <span>{notice}</span>
          </div>
        )}

        {/* --- MAIN CONTENT GRID --- */}
        <div className="dashboard-grid">
          {/* LEFT COLUMN: ID CARD & SKIP STATS */}
          <div className="dashboard-left">
            {/* ID Card */}
            <div className="id-card">
              <h3 className="id-card-heading">JKLU MESS PASS</h3>
              <p className="id-card-subtitle">Present this QR at the scanner</p>
              <div className="qr-frame">
                <img src={qrCodeUrl} alt="QR Code" />
              </div>
              <h2 className="id-card-name">{userName}</h2>
              <p className="id-card-email">{userEmail}</p>
            </div>

            {/* Skip Stats Card */}
            {menuData.skipStats && (
              <div className="skip-stats-card">
                <h3> Monthly Skips Remaining</h3>
                {Object.keys(menuData.skipStats).map((mealType) => (
                  <div key={mealType} className="skip-stat-row">
                    <span className="skip-stat-label">{mealType}</span>
                    <span
                      style={{
                        color:
                          menuData.skipStats[mealType].remaining === 0
                            ? "#ef4444"
                            : "#10b981",
                        fontWeight: "bold",
                      }}
                    >
                      {menuData.skipStats[mealType].remaining} /{" "}
                      {menuData.skipStats[mealType].limit}
                    </span>
                  </div>
                ))}
                <p className="skip-stat-note">
                  *Skipped meals will be credited to your rebate account at
                  month end.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TODAY & TOMORROW MENUS */}
          <div className="dashboard-right">
            {/* Today Menu Card */}
            <div className="menu-card">
              <h3 className="menu-card-title">
                 Today ({menuData.todayName})
              </h3>
              <div className="meals-grid">
                {menuData.todayMenu.length > 0 ? (
                  menuData.todayMenu.map((meal, index) => (
                    <div key={index} className="meal-box-today">
                      <h4>{meal.mealType}</h4>
                      <p>{meal.items.join(", ")}</p>
                    </div>
                  ))
                ) : (
                  <p className="menu-empty">No menu uploaded for today.</p>
                )}
              </div>
            </div>

            {/* Tomorrow Menu Card */}
            <div className="menu-card-bordered">
              <div className="tomorrow-header">
                <h3> Tomorrow ({menuData.tomorrowName})</h3>
                <span className="manage-badge">Manage Meals</span>
              </div>

              <div className="meals-grid">
                {menuData.tomorrowMenu.length > 0 ? (
                  menuData.tomorrowMenu.map((meal, index) => {
                    const isCancelled = menuData.tomorrowBookings.some(
                      (b) =>
                        b.mealType === meal.mealType &&
                        b.status === "Cancelled",
                    );

                    return (
                      <div
                        key={index}
                        className={`meal-box-tomorrow ${isCancelled ? "cancelled" : ""}`}
                      >
                        <div className="meal-box-header">
                          <h4
                            className={`meal-type-label ${isCancelled ? "cancelled" : ""}`}
                          >
                            {meal.mealType}
                          </h4>
                          <button
                            onClick={() =>
                              handleToggleMeal(
                                meal.mealType,
                                isCancelled ? "Cancelled" : "Booked",
                              )
                            }
                            className={
                              isCancelled ? "btn-add-back" : "btn-skip"
                            }
                          >
                            {isCancelled ? "Add Back" : "Skip Meal"}
                          </button>
                        </div>
                        <p
                          className={`meal-items-text ${isCancelled ? "cancelled" : ""}`}
                        >
                          {meal.items.join(", ")}
                        </p>
                        {isCancelled && (
                          <p className="cancelled-label">
                             Cancelled for Rebate
                          </p>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="menu-empty">No menu uploaded for tomorrow.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- FULL WEEKLY MENU SECTION --- */}
        <div className="weekly-section">
          <h3> Full Weekly Meal Plan</h3>
          <div className="weekly-grid">
            {allDaysOfWeek.map((day) => {
              const dayMeals = menuData.fullMenu.filter(
                (m) => m.dayOfWeek === day,
              );
              if (dayMeals.length === 0) return null;

              return (
                <div key={day} className="day-card">
                  <h4>{day}</h4>
                  {dayMeals.map((meal, idx) => (
                    <div key={idx} className="day-meal-row">
                      <span className="day-meal-type">{meal.mealType}</span>
                      <span className="day-meal-items">
                        {meal.items.join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {menuData.fullMenu.length === 0 && (
            <p className="weekly-empty">
              The weekly menu has not been uploaded yet. Please ask an admin to
              update it.
            </p>
          )}
          {/* --- FOOD REVIEW & COMPLAINT SECTION --- */}
          <div className="review-section">
            <h3>⭐ Rate Today's Meal & Feedback</h3>
            <p className="review-subtitle">
              Found an issue with the food? Upload a photo and let the admin
              know.
            </p>

            <form onSubmit={handleReviewSubmit} className="review-form">
              {/* Star Rating */}
              <div className="form-group">
                <label>Food Quality Rating:</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${rating >= star ? "active" : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Comment/Complaint Box */}
              <div className="form-group">
                <label>Your Comments / Complaints:</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="The food was great! OR I found a bug in my dal..."
                  className="form-control"
                  rows="3"
                />
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label>Attach Proof (Optional):</label>
                <input
                  type="file"
                  id="imageUploadInput"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="file-input"
                />
              </div>

              <button type="submit" className="btn-submit-review">
                 Submit Feedback
              </button>

              {/* Success/Error Message */}
              {reviewMsg && (
                <div
                  className={`review-msg ${reviewMsg.includes("✅") ? "success" : "error"}`}
                >
                  {reviewMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
