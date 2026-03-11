import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Form State (For Contractor)
  const [day, setDay] = useState("Monday");
  const [meal, setMeal] = useState("Breakfast");
  const [foodItems, setFoodItems] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Analytics, Ledger & Reviews State
  const [stats, setStats] = useState({
    Breakfast: 0,
    Lunch: 0,
    Snacks: 0,
    Dinner: 0,
  });
  const [totalSaved, setTotalSaved] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [openStudentIndex, setOpenStudentIndex] = useState(null);

  // Reviews ke liye state
  const [reviews, setReviews] = useState([]);

  //  NAYA STATE: Students ki list ke liye 
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const allowedRoles = ["admin", "contractor", "accountant"];

      if (!allowedRoles.includes(parsedUser.role)) {
        alert("Access Denied: Authorized Staff Only");
        navigate("/dashboard");
      } else {
        setUser(parsedUser);
        fetchAdminData(parsedUser.role); // Role pass kiya taaki data filter ho sake
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchAdminData = async (role) => {
    try {
      // 1. Fetch Headcount
      const resStats = await axios.get(
        "http://localhost:5000/api/admin/headcount",
      );
      if (resStats.data.success) {
        setStats(resStats.data.stats);
        setTotalSaved(resStats.data.totalSaved);
      }

      // 2. Fetch Ledger
      const resLedger = await axios.get(
        "http://localhost:5000/api/admin/ledger",
      );
      if (resLedger.data.success) {
        setLedger(resLedger.data.ledger);
      }

      // 3. Fetch Reviews
      const resReviews = await axios.get(
        "http://localhost:5000/api/reviews/all",
      );
      if (resReviews.data.success) {
        setReviews(resReviews.data.reviews);
      }

      //  NAYA CODE: Fetch Students (Sirf Admin ke liye) 
      if (role === "admin") {
        const resStudents = await axios.get(
          "http://localhost:5000/api/admin/students",
        );
        if (resStudents.data.success) {
          setStudents(resStudents.data.students);
        }
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    setStatusMsg("Updating...");
    try {
      const itemsArray = foodItems
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      const res = await axios.post("http://localhost:5000/api/admin/menu", {
        dayOfWeek: day,
        mealType: meal,
        items: itemsArray,
      });

      if (res.data.success) {
        setStatusMsg(`✅ Success: ${meal} on ${day} has been updated!`);
        setFoodItems("");
      }
    } catch (error) {
      console.error(error);
      setStatusMsg("❌ Failed to update menu.");
    }
  };

  const handleExportCSV = () => {
    let csvContent =
      "data:text/csv;charset=utf-8,Student Name,Email,Total Skips,Meal Details\n";

    ledger.forEach((student) => {
      const mealsStr = student.meals.join(" | ");
      const row = `${student.name},${student.email},${student.totalCancelled},${mealsStr}`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Refund_Ledger_${new Date().toLocaleString("en-US", { month: "short" })}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Block / Unblock function 
  const handleToggleBlock = async (studentId, currentStatus) => {
    try {
      const newStatus = !currentStatus; // Agar block hai toh unblock (false), nahi toh block (true)

      const res = await axios.post(
        "http://localhost:5000/api/admin/students/block",
        {
          studentId,
          isBlocked: newStatus,
        },
      );

      if (res.data.success) {
        // UI mein student ka status turant update kar do bina page refresh kiye
        setStudents(
          students.map((s) =>
            s._id === studentId ? { ...s, isBlocked: newStatus } : s,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating student status.");
    }
  };

  if (!user)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading Admin Portal...
      </div>
    );

  const canSeeKitchenControls =
    user.role === "admin" || user.role === "contractor";
  const canSeeFinancials = user.role === "admin" || user.role === "accountant";
  const canSeeReviews = user.role === "admin" || user.role === "contractor";

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        {/* HEADER */}
        <div className="admin-header">
          <div>
            <h1>👨‍💻 Staff Portal</h1>
            <span className="admin-role-badge">Logged in as: {user.role}</span>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-back">
            Back to Dashboard
          </button>
        </div>

        {/* --- BROADCAST NOTICE BOARD --- */}
        {(user.role === "admin" || user.role === "contractor") && (
          <div
            className="admin-card"
            style={{ marginBottom: "30px", borderTop: "6px solid #ef4444" }}
          >
            <h2 className="card-title">📢 Broadcast Notice</h2>
            <p className="card-subtitle">
              Send an alert message to all students' dashboards.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const msg = e.target.noticeMsg.value;
                try {
                  await axios.post("http://localhost:5000/api/admin/notice", {
                    message: msg,
                  });
                  alert("✅ Notice sent to all students!");
                  e.target.reset();
                } catch (err) {
                  alert("❌ Failed to send notice");
                }
              }}
            >
              <div className="form-group">
                <textarea
                  name="noticeMsg"
                  required
                  className="form-control"
                  placeholder="Type important notice here (e.g. Special menu today, timings changed)..."
                  style={{ minHeight: "80px" }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: "#ef4444" }}
              >
                🚀 Send Notice
              </button>
            </form>
          </div>
        )}

        {/* ---  NAYA CODE: STUDENT MANAGEMENT SECTION (ADMIN ONLY)  --- */}
        {user.role === "admin" && (
          <div
            className="admin-card"
            style={{ marginBottom: "30px", borderTop: "6px solid #3b82f6" }}
          >
            <h2 className="card-title">🛡️ Student Management</h2>
            <p className="card-subtitle">
              Block or unblock students from accessing the mess.
            </p>

            {students.length === 0 ? (
              <p className="empty-msg">No students found.</p>
            ) : (
              <div style={{ overflowX: "auto", marginTop: "15px" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #cbd5e1",
                      }}
                    >
                      <th style={{ padding: "12px" }}>Name</th>
                      <th style={{ padding: "12px" }}>Email</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        style={{ borderBottom: "1px solid #e2e8f0" }}
                      >
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: "bold",
                            color: "#334155",
                          }}
                        >
                          {student.name}
                        </td>
                        <td style={{ padding: "12px", color: "#64748b" }}>
                          {student.email}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {student.isBlocked ? (
                            <span
                              style={{
                                backgroundColor: "#fee2e2",
                                color: "#991b1b",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                fontSize: "12px",
                              }}
                            >
                              🚫 Blocked
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: "#dcfce7",
                                color: "#166534",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                fontSize: "12px",
                              }}
                            >
                              ✅ Active
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <button
                            onClick={() =>
                              handleToggleBlock(student._id, student.isBlocked)
                            }
                            style={{
                              padding: "6px 12px",
                              backgroundColor: student.isBlocked
                                ? "#10b981"
                                : "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            {student.isBlocked ? "Unlock ✅" : "Block 🚫"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- CONTRACTOR SECTION (Kitchen Controls) --- */}
        {canSeeKitchenControls && (
          <div className="section-grid">
            {/* UPDATE MENU FORM */}
            <div className="admin-card">
              <h2 className="card-title">Update Mess Menu</h2>
              <p className="card-subtitle">Change today's food offerings.</p>
              <form
                onSubmit={handleUpdateMenu}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <div className="form-group">
                  <label className="form-label">Select Day</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="form-control"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Meal</label>
                  <select
                    value={meal}
                    onChange={(e) => setMeal(e.target.value)}
                    className="form-control"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Food Items</label>
                  <textarea
                    value={foodItems}
                    onChange={(e) => setFoodItems(e.target.value)}
                    placeholder="e.g. Paneer, Naan, Rice"
                    required
                    className="form-control"
                    style={{ minHeight: "100px" }}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Update Menu
                </button>
                {statusMsg && (
                  <div
                    style={{
                      padding: "12px",
                      marginTop: "15px",
                      backgroundColor: statusMsg.includes("✅")
                        ? "#dcfce7"
                        : "#fee2e2",
                      color: statusMsg.includes("✅") ? "#166534" : "#991b1b",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {statusMsg}
                  </div>
                )}
              </form>
            </div>

            {/* LIVE ANALYTICS */}
            <div className="admin-card card-orange-top">
              <h2 className="card-title">📊 Tomorrow's Kitchen Headcount</h2>
              <p className="card-subtitle">
                Live headcount of meals skipped to avoid food wastage.
              </p>
              <div className="stats-grid">
                {Object.keys(stats).map((mealType) => (
                  <div key={mealType} className="stat-box">
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        color: "#475569",
                        fontSize: "16px",
                      }}
                    >
                      {mealType}
                    </h3>
                    <span
                      className="stat-value"
                      style={{
                        color: stats[mealType] > 0 ? "#ef4444" : "#10b981",
                      }}
                    >
                      {stats[mealType]}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#94a3b8",
                        marginTop: "5px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      Cancelled
                    </span>
                  </div>
                ))}
              </div>
              <div className="stat-saved-banner">
                Total Meals Saved Tomorrow: {totalSaved}
              </div>
            </div>
          </div>
        )}

        {/* --- ACCOUNTANT SECTION (Ledger) --- */}
        {canSeeFinancials && (
          <div
            className="admin-card card-green-top"
            style={{ marginBottom: "30px" }}
          >
            <div className="ledger-header-flex">
              <div>
                <h2 className="card-title">💰 Monthly Refund Ledger</h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  List of students who cancelled meals this month.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="btn-export"
                disabled={ledger.length === 0}
              >
                📥 Download CSV
              </button>
            </div>

            {ledger.length === 0 ? (
              <p className="empty-msg">No meals cancelled this month yet.</p>
            ) : (
              <div className="accordion-container">
                {ledger.map((student, idx) => {
                  const isOpen = openStudentIndex === idx;
                  return (
                    <div key={idx} className="accordion-item">
                      <div
                        className={`accordion-header ${isOpen ? "active" : ""}`}
                        onClick={() => setOpenStudentIndex(isOpen ? null : idx)}
                      >
                        <div>
                          <h3 className="student-name">👤 {student.name}</h3>
                          <span className="student-email">{student.email}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                          <span className="badge-red">
                            {student.totalCancelled} Meals Skipped
                          </span>
                          <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                            {isOpen ? "🔼" : "🔽"}
                          </span>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="accordion-body">
                          <h4
                            style={{
                              margin: "0 0 15px 0",
                              fontSize: "13px",
                              color: "#334155",
                              textTransform: "uppercase",
                              letterSpacing: "1px",
                            }}
                          >
                            Cancellation Records:
                          </h4>
                          <div className="meal-grid">
                            {student.meals.map((meal, i) => (
                              <div key={i} className="meal-pill">
                                🚫 {meal}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- REVIEWS & FEEDBACK SECTION --- */}
        {canSeeReviews && (
          <div className="admin-card card-purple-top">
            <div className="ledger-header-flex">
              <div>
                <h2 className="card-title">
                  ⭐ Student Feedbacks & Complaints
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  Latest reviews and issue reports from students.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="empty-msg">No reviews submitted yet.</p>
            ) : (
              <div className="review-grid">
                {reviews.map((review, idx) => (
                  <div key={idx} className="review-card">
                    <div className="review-header">
                      <div>
                        <h3 className="student-name">
                          👤 {review.studentName}
                        </h3>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <div className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p className="review-comment">"{review.comment}"</p>
                    {review.image && (
                      <div className="review-proof">
                        <p className="proof-label">📸 Attached Proof:</p>
                        <a
                          href={`http://localhost:5000/uploads/${review.image}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={`http://localhost:5000/uploads/${review.image}`}
                            alt="Proof"
                            className="proof-img"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}