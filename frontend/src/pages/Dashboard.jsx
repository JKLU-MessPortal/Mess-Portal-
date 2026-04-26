import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");
  const [adminStats, setAdminStats] = useState(null);

  // ── Complaint Box state ──────────────────────────────────────
  const [complaintText, setComplaintText]   = useState("");
  const [complaintImage, setComplaintImage] = useState(null);
  const [complaintMsg, setComplaintMsg]     = useState("");
  const [submitting, setSubmitting]         = useState(false);

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;
    setSubmitting(true);
    setComplaintMsg("");
    const fd = new FormData();
    fd.append("studentId",   user.id || user._id);
    fd.append("studentName", user.name);
    fd.append("text",        complaintText.trim());
    if (complaintImage) fd.append("image", complaintImage);
    try {
      const res = await axios.post("http://localhost:5000/api/complaints", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setComplaintMsg("✅ Complaint submitted! The admin will review it shortly.");
        setComplaintText("");
        setComplaintImage(null);
        const fi = document.getElementById("complaint-file-input");
        if (fi) fi.value = "";
      }
    } catch {
      setComplaintMsg("❌ Failed to submit. Please try again.");
    } finally { setSubmitting(false); }
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

      const role = parsedUser.role || "student";
      const staff = ["admin", "contractor", "accountant"].includes(role);
      
      if (staff) {
        axios.get("http://localhost:5000/api/admin/headcount").then(res => {
          if (res.data.success) {
            setAdminStats({
              stats: res.data.stats,
              totalHostellers: res.data.totalHostellers
            });
          }
        }).catch(err => console.log("Admin Stats Error:", err));
      }
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
        alert(+error.response.data.message);
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
  const userRole = user.role || "student";
  const isStaff = ["admin", "contractor", "accountant"].includes(userRole);
  const isHosteller = user.residencyStatus === "Hosteller";
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

  const handleSharePass = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JKLU Mess Pass',
          text: `Here is my JKLU Mess Pass: ${userName} (${userId})`,
          url: qrCodeUrl,
        });
      } catch (error) {
        console.log('Error sharing pass:', error);
      }
    } else {
      navigator.clipboard.writeText(qrCodeUrl);
      alert("QR Code link copied to clipboard! (Your browser does not support native sharing)");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <Navbar />

        {/* --- BROADCAST NOTICE BOARD --- */}
        {notice && (
          <div className="notice-banner">
            <div className="notice-banner-icon">📢</div>
            <p className="notice-text-content">
              <span className="notice-badge">Alert Notice</span>
              {notice}
            </p>
          </div>
        )}

        {/* --- MAIN CONTENT GRID --- */}
        <div className="dashboard-grid">
          {/* LEFT COLUMN: ID CARD & SKIP STATS */}
          <div className="dashboard-left">
            {!isStaff ? (
              <>
                {/* ID Card */}
                <div className="id-card">
                  <h3 className="id-card-heading">JKLU MESS PASS</h3>
                  <p className="id-card-subtitle">Present this QR at the scanner</p>
                  <div className="qr-frame">
                    <img src={qrCodeUrl} alt="QR Code" />
                  </div>
                  <h2 className="id-card-name">{userName}</h2>
                  <p className="id-card-email">{userEmail}</p>
                  <button 
                    onClick={handleSharePass} 
                    style={{ 
                      marginTop: '15px', 
                      background: '#f1f5f9', 
                      border: '1px solid #cbd5e1', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: 'bold', 
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                  >
                    📤 Share Pass
                  </button>
                </div>

                {/* Skip Stats Card - Only for Hostellers */}
                {isHosteller && menuData.skipStats && (
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
                {!isHosteller && (
                  <div className="skip-stats-card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>💳 Day-Scholar Wallet</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
                      Purchase meals for tomorrow using your portal. Purchased meals will activate your QR code at the scanner.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#334155' }}>Price Per Meal:</span>
                      <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>₹50</strong>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="skip-stats-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#1f2937' }}>📈 Analytics</h3>
                {adminStats ? (
                  <>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                      <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Hostellers</span>
                      <strong style={{ fontSize: '1.5rem', color: '#0f172a' }}>{adminStats.totalHostellers || 0}</strong>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {Object.keys(adminStats.stats).map((mealType) => {
                        const skipped = adminStats.stats[mealType];
                        const expected = Math.max(0, (adminStats.totalHostellers || 0) - skipped);
                        return (
                          <div key={mealType} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                            <span style={{ fontWeight: '600', color: '#334155' }}>{mealType}</span>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ color: '#10b981', fontWeight: 'bold', display: 'block' }}>{expected} Eating</span>
                              <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>{skipped} Skipped</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p style={{ color: '#64748b' }}>Loading analytics...</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TODAY & TOMORROW MENUS */}
          <div className="dashboard-right">
            {/* Today Menu Card */}
            <div className="menu-card">
              <h3 className="menu-card-title">Today ({menuData.todayName})</h3>
              <div className="meals-grid">
                {menuData.todayMenu.length > 0 ? (
                  [...menuData.todayMenu]
                    .sort((a, b) => { const o={Breakfast:1,Lunch:2,Snacks:3,Dinner:4}; return o[a.mealType]-o[b.mealType]; })
                    .map((meal, index) => (
                      <div key={index} style={{
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                        overflow: 'hidden', marginBottom: '10px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                      }}>
                        {/* Meal header */}
                        <div style={{
                          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                          padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                          <span style={{ fontSize: '1.1rem' }}>
                            {meal.mealType === 'Breakfast' ? '🌅' : meal.mealType === 'Lunch' ? '☀️' : meal.mealType === 'Snacks' ? '🍵' : '🌙'}
                          </span>
                          <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.9rem' }}>{meal.mealType}</span>
                          {meal.nonVegItems && meal.nonVegItems.length > 0 && (
                            <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>⭐ Non-Veg</span>
                          )}
                        </div>
                        {/* Items */}
                        <div style={{ padding: '8px 14px' }}>
                          {meal.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '0.82rem', color: '#166534', borderBottom: i < meal.items.length - 1 ? '1px solid #f0fdf4' : 'none' }}>
                              <span style={{ color: '#10b981', fontSize: '0.7rem' }}>●</span>{item}
                            </div>
                          ))}
                          {meal.nonVegItems && meal.nonVegItems.length > 0 && (
                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #fecdd3' }}>
                              {meal.nonVegItems.map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '0.82rem', color: '#9f1239' }}>
                                  <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>●</span>{item}
                                  <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#b91c1c', fontWeight: 700 }}>+₹ Extra</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
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
                {!isStaff && <span className="manage-badge">Manage Meals</span>}
              </div>

              <div className="meals-grid">
                {menuData.tomorrowMenu.length > 0 ? (
                  [...menuData.tomorrowMenu]
                    .sort((a, b) => { const o={Breakfast:1,Lunch:2,Snacks:3,Dinner:4}; return o[a.mealType]-o[b.mealType]; })
                    .map((meal, index) => {
                      const isCancelled = menuData.tomorrowBookings.some(b => b.mealType === meal.mealType && b.status === "Cancelled");
                      const isPaid = menuData.tomorrowBookings.some(b => b.mealType === meal.mealType && b.status === "Paid");

                      return (
                        <div key={index} style={{
                          background: isCancelled ? '#fef2f2' : isPaid ? '#ecfdf5' : 'white',
                          border: isCancelled ? '1px solid #fca5a5' : isPaid ? '1px solid #6ee7b7' : '1px solid #e2e8f0',
                          borderRadius: '12px', overflow: 'hidden', marginBottom: '10px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)', opacity: isCancelled ? 0.75 : 1
                        }}>
                          {/* Meal header */}
                          <div style={{
                            background: isCancelled ? 'linear-gradient(135deg,#fee2e2,#fca5a5)' : isPaid ? 'linear-gradient(135deg,#d1fae5,#6ee7b7)' : 'linear-gradient(135deg,#fef3c7,#fde68a)',
                            padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px'
                          }}>
                            <span style={{ fontSize: '1.1rem' }}>
                              {meal.mealType === 'Breakfast' ? '🌅' : meal.mealType === 'Lunch' ? '☀️' : meal.mealType === 'Snacks' ? '🍵' : '🌙'}
                            </span>
                            <span style={{ fontWeight: 700, color: isCancelled ? '#991b1b' : isPaid ? '#065f46' : '#92400e', fontSize: '0.9rem' }}>
                              {meal.mealType}
                            </span>
                            {isCancelled && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, color: '#dc2626' }}>⛔ Skipped</span>}
                            {isPaid && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700, color: '#059669' }}>✅ Purchased</span>}
                            {meal.nonVegItems && meal.nonVegItems.length > 0 && !isCancelled && !isPaid && (
                              <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.58rem', fontWeight: 700, padding: '2px 7px', borderRadius: '999px' }}>⭐ Non-Veg</span>
                            )}
                          </div>

                          {/* Items list */}
                          <div style={{ padding: '8px 14px' }}>
                            {meal.items.map((item, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '0.82rem', color: isCancelled ? '#94a3b8' : '#166534', borderBottom: i < meal.items.length - 1 ? '1px solid #f0fdf4' : 'none', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                                <span style={{ color: '#10b981', fontSize: '0.7rem' }}>●</span>{item}
                              </div>
                            ))}
                            {meal.nonVegItems && meal.nonVegItems.length > 0 && (
                              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #fecdd3' }}>
                                {meal.nonVegItems.map((item, i) => (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '0.82rem', color: '#9f1239' }}>
                                    <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>●</span>{item}
                                    <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#b91c1c', fontWeight: 700 }}>+₹ Extra</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action button */}
                          {!isStaff && (
                            <div style={{ padding: '0 14px 12px', display: 'flex', justifyContent: 'flex-end' }}>
                              {isHosteller ? (
                                <button
                                  onClick={() => handleToggleMeal(meal.mealType, isCancelled ? "Cancelled" : "Booked")}
                                  style={{
                                    padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem',
                                    fontWeight: 700, border: 'none', cursor: 'pointer',
                                    background: isCancelled ? '#10b981' : '#ef4444',
                                    color: 'white'
                                  }}
                                >
                                  {isCancelled ? "↩ Add Back" : "⏭ Skip Meal"}
                                </button>
                              ) : (
                                <button
                                  onClick={() => { if (!isPaid && window.confirm(`Purchase ${meal.mealType} for ₹50?`)) handleToggleMeal(meal.mealType, "Paid"); }}
                                  disabled={isPaid}
                                  style={{
                                    padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem',
                                    fontWeight: 700, border: 'none',
                                    cursor: isPaid ? 'default' : 'pointer',
                                    background: isPaid ? '#10b981' : '#3b82f6',
                                    color: 'white'
                                  }}
                                >
                                  {isPaid ? "✅ Purchased" : "🛒 Buy (₹50)"}
                                </button>
                              )}
                            </div>
                          )}
                          {isCancelled && isHosteller && <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#dc2626', paddingBottom:'8px', margin:0 }}>Cancelled for Rebate</p>}
                          {isPaid && !isHosteller && <p style={{ textAlign:'center', fontSize:'0.72rem', color:'#059669', paddingBottom:'8px', margin:0 }}>🎫 Ticket ready for scanner</p>}
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

          {/* ── COMPLAINT BOX ── */}
          {!isStaff && (
            <div className="complaint-section">
              <div className="complaint-header">
                <span className="complaint-icon">🚨</span>
                <div>
                  <h3 className="complaint-title">Complaint Box</h3>
                  <p className="complaint-subtitle">Report any food quality, hygiene or service issues. The admin will be notified immediately.</p>
                </div>
              </div>

              <form onSubmit={handleComplaintSubmit} className="complaint-form">
                <div className="complaint-field">
                  <label className="complaint-label">Describe your complaint <span className="complaint-req">(required)</span></label>
                  <textarea
                    required
                    value={complaintText}
                    onChange={e => setComplaintText(e.target.value)}
                    placeholder="e.g. Found a foreign object in the dal, food was undercooked, unhygienic counter..."
                    className="complaint-textarea"
                    rows={4}
                  />
                </div>

                <div className="complaint-field">
                  <label className="complaint-label">Attach proof <span className="complaint-optional">(optional — max 8 MB)</span></label>
                  <label className="complaint-file-label" htmlFor="complaint-file-input">
                    <span className="complaint-file-icon">📎</span>
                    {complaintImage ? complaintImage.name : "Click to upload a photo"}
                  </label>
                  <input
                    id="complaint-file-input"
                    type="file"
                    accept="image/*"
                    className="complaint-file-hidden"
                    onChange={e => setComplaintImage(e.target.files[0] || null)}
                  />
                </div>

                <button type="submit" className="complaint-submit" disabled={submitting || !complaintText.trim()}>
                  {submitting ? "Submitting…" : "🚨 Submit Complaint"}
                </button>

                {complaintMsg && (
                  <div className={`complaint-msg ${complaintMsg.includes("✅") ? "complaint-msg--ok" : "complaint-msg--err"}`}>
                    {complaintMsg}
                  </div>
                )}
              </form>
            </div>
          )}

      </div>
    </div>
  );
}
