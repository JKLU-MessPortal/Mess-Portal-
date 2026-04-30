import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import NonVegBookingModal from "../components/NonVegBookingModal";
import "./Dashboard.css";

import { Coffee, Sun, Utensils, Moon, Info, ChevronUp, Share2, AlertTriangle, CheckCircle2, ShoppingCart, UtensilsCrossed } from "lucide-react";

// ── Shared helpers ──────────────────────────────────────────────
const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };
const MEAL_ICONS = { 
  Breakfast: <Coffee size={24} />, 
  Lunch: <Sun size={24} />, 
  Snacks: <Utensils size={24} />, 
  Dinner: <Moon size={24} /> 
};
const MEAL_COLORS = {
  Breakfast: { bg: "#fff7ed", border: "#fdba74", text: "#9a3412", icon: "#f97316" },
  Lunch:     { bg: "#fefce8", border: "#fde047", text: "#854d0e", icon: "#eab308" },
  Snacks:    { bg: "#f0fdf4", border: "#86efac", text: "#166534", icon: "#10b981" },
  Dinner:    { bg: "#eef2ff", border: "#a5b4fc", text: "#3730a3", icon: "#6366f1" },
};
const EGG_KEYWORDS = ["egg", "omelette", "omlette", "boiled egg", "anda", "bhurji"];
const isEggItem = (item) => EGG_KEYWORDS.some((kw) => item.toLowerCase().includes(kw));

// ─── Nutrition Bar ─────────────────────────────────────────────────
function NutritionBar({ label, value, max, color, unit = "g" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "3px" }}>
        <span>{label}</span>
        <span style={{ color }}>{value}{unit}</span>
      </div>
      <div style={{ background: "#f1f5f9", borderRadius: "99px", height: "6px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: "99px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Dish Row ──────────────────────────────────────────────────────
function DishRow({ dishName, nutritionMap, isNonVeg = false, isPaid = false }) {
  const [open, setOpen] = useState(false);
  const query = dishName.toLowerCase().trim();
  const match =
    nutritionMap[query] ||
    Object.values(nutritionMap).find(
      (d) => d.name.toLowerCase().includes(query) || query.includes(d.name.toLowerCase())
    );

  const rowBg = isNonVeg ? "#fff1f2" : "#f0fdf4";
  const rowBorder = isNonVeg ? "#fecdd3" : "#bbf7d0";
  const textColor = isNonVeg ? "#9f1239" : "#166534";

  return (
    <div style={{ marginBottom: "6px" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: rowBg, border: `1px solid ${rowBorder}`,
          borderRadius: open ? "10px 10px 0 0" : "10px",
          padding: "9px 14px", cursor: match ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontFamily: "inherit", textAlign: "left"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
           <span style={{ fontSize: "0.86rem", color: textColor, fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
            {isNonVeg ? <UtensilsCrossed size={16} /> : <Utensils size={16} />} {dishName}
          </span>
          {isNonVeg && isPaid && (
            <span style={{ fontSize: "0.65rem", background: "#10b981", color: "white", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>
              PAID
            </span>
          )}
        </div>
        {match && (
          <span style={{
            fontSize: "0.68rem", fontWeight: 700,
            color: open ? "#f59e0b" : "#94a3b8",
            transition: "color 0.2s",
            display: "flex", alignItems: "center", gap: "3px"
          }}>
            {open ? <ChevronUp size={14} /> : <Info size={14} />} {open ? "Hide" : "Nutrition"}
          </span>
        )}
      </button>

      {open && match && (
        <div style={{
          background: "white", border: `1px solid ${rowBorder}`,
          borderTop: "none", borderRadius: "0 0 10px 10px",
          padding: "14px", animation: "fadeIn 0.2s ease"
        }}>
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📏</span>
            <span>Per serving: <strong style={{ color: "#475569" }}>{match.quantity_unit}</strong></span>
          </div>
          <div style={{
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            borderRadius: "8px", padding: "10px 14px", marginBottom: "12px",
            display: "flex", alignItems: "center", gap: "10px"
          }}>
            <span style={{ fontSize: "1.6rem" }}>🔥</span>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#92400e", lineHeight: 1 }}>{match.calories} kcal</div>
              <div style={{ fontSize: "0.7rem", color: "#b45309" }}>Total Calories per serving</div>
            </div>
          </div>
          <NutritionBar label="💪 Protein"       value={match.protein}    max={30} color="#10b981" />
          <NutritionBar label="🌾 Carbohydrates" value={match.carbohydrate} max={80} color="#3b82f6" />
          <NutritionBar label="🫒 Fat"           value={match.fat}        max={30} color="#f59e0b" />
          <NutritionBar label="🌿 Dietary Fibre" value={match.fibre}      max={10} color="#8b5cf6" />
          <NutritionBar label="🍬 Free Sugar"    value={match.free_sugar}  max={20} color="#ec4899" />
        </div>
      )}
    </div>
  );
}

// ─── Meal Modal (popup with blur) ──────────────────────────────────
function MealModal({ meal, dietaryPref, nutritionMap, onClose, isTomorrow, isCancelled, isPaid, isStaff, isHosteller, handleToggleMeal, setNvModal, nonVegBookings }) {
  const colors = MEAL_COLORS[meal.mealType] || MEAL_COLORS.Lunch;

  const filterNonVeg = (items = []) => {
    if (!items || items.length === 0) return [];
    if (dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)") return [];
    if (dietaryPref === "Eggetarian") return items.filter(isEggItem);
    return items;
  };

  const visibleNonVeg = filterNonVeg(meal.nonVegItems);
  const hasNonVeg = visibleNonVeg.length > 0;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} style={{zIndex: 1000}}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={`${meal.mealType} menu`}>
        <div
          className="modal-header"
          style={{
            background: colors.bg,
            borderBottom: `1px solid ${colors.border}`,
            padding: "20px"
          }}
        >
          <div className="modal-header-left">
            <span className="modal-icon" style={{ color: colors.icon, background: "white", padding: "10px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {MEAL_ICONS[meal.mealType]}
            </span>
            <div>
              <h2 className="modal-title" style={{ color: colors.text }}>{meal.mealType} {isTomorrow && isCancelled && "(Cancelled)"} {isTomorrow && isPaid && "(Purchased)"}</h2>
              <p className="modal-subtitle">{meal.items.length} veg dish{meal.items.length !== 1 ? "es" : ""}{hasNonVeg ? ` · ${visibleNonVeg.length} non-veg` : ""}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Action Bar for Tomorrow */}
        {isTomorrow && !isStaff && (
          <div style={{ padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             {isHosteller ? (
                <>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Manage Hosteller Meal</span>
                  <button
                    onClick={() => handleToggleMeal(meal.mealType, isCancelled ? "Cancelled" : "Booked")}
                    className={isCancelled ? "btn-add-back" : "btn-skip"}
                  >
                    {isCancelled ? "Add Back" : "Skip Meal"}
                  </button>
                </>
              ) : (
                <>
                   <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Purchase Day-Scholar Meal</span>
                  <button
                    onClick={() => { if (!isPaid && window.confirm(`Purchase ${meal.mealType} for ₹50?`)) handleToggleMeal(meal.mealType, "Paid"); }}
                    disabled={isPaid}
                    className="btn-skip"
                    style={isPaid ? { background: '#10b981', color: 'white', cursor: 'default', border: 'none' } : { background: '#3b82f6', color: 'white' }}
                  >
                    {isPaid ? "✅ Purchased" : "🛒 Buy (₹50)"}
                  </button>
                </>
              )}
          </div>
        )}

        <div className="modal-body">
          <div className="modal-section" style={{ opacity: isCancelled ? 0.6 : 1 }}>
            <div className="modal-section-label" style={{ color: "#15803d" }}>
              🟢 Vegetarian Items
              <span className="modal-section-hint">— tap a dish for nutrition</span>
            </div>
            {meal.items.map((item, i) => (
              <DishRow key={i} dishName={item} nutritionMap={nutritionMap} isNonVeg={false} />
            ))}
          </div>

          {hasNonVeg && (
            <div className="modal-section" style={{ opacity: isCancelled ? 0.6 : 1 }}>
              <div className="modal-section-label" style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }}></span> Non-Veg Items
                <span className="modal-nonveg-badge">💳 Extra Payment</span>
              </div>
              <p className="modal-nonveg-warning">
                <AlertTriangle size={14} style={{ flexShrink: 0 }} /> Non-veg dishes are prepared separately and charged additionally.
              </p>
              {visibleNonVeg.map((item, i) => {
                const isPaidItem = nonVegBookings?.some(b => b.mealType === meal.mealType && b.item === item && new Date(b.date).toDateString() === (isTomorrow ? new Date(Date.now() + 86400000).toDateString() : new Date().toDateString()));

                return (
                  <div key={i} style={{ marginBottom: "6px" }}>
                    <DishRow dishName={item} nutritionMap={nutritionMap} isNonVeg={true} isPaid={isPaidItem} />
                    {isTomorrow && !isStaff && !isCancelled && !isPaidItem && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-4px", marginBottom: "8px" }}>
                         <button
                            onClick={() => setNvModal({ item: item, mealType: meal.mealType, tomorrowDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] })}
                            style={{
                              background: '#ef4444',
                              color: 'white', border: 'none', borderRadius: '6px',
                              padding: '6px 12px', fontSize: '0.72rem', fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <ShoppingCart size={12} /> Book {item} (₹{item.toLowerCase().includes('egg') || ['omelette','omlette','anda','bhurji'].some(k => item.toLowerCase().includes(k)) ? 30 : 120})
                          </button>
                      </div>
                    )}
                    {isPaidItem && (
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-4px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                          <CheckCircle2 size={12} /> Confirmed & Paid
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Today's & Tomorrow Meal Tile ─────────────────────────────────────────────
function MealTile({ meal, dietaryPref, nutritionMap, isTomorrow, isCancelled, isPaid, isStaff, isHosteller, handleToggleMeal, setNvModal, nonVegBookings }) {
  const [open, setOpen] = useState(false);
  const colors = MEAL_COLORS[meal.mealType] || MEAL_COLORS.Lunch;

  const filterNonVeg = (items = []) => {
    if (!items || items.length === 0) return [];
    if (dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)") return [];
    if (dietaryPref === "Eggetarian") return items.filter(isEggItem);
    return items;
  };

  const visibleNonVeg = filterNonVeg(meal.nonVegItems);
  const hasNonVeg = visibleNonVeg.length > 0;

  return (
    <>
      <button
        className={`meal-tile ${isCancelled ? "cancelled" : ""} ${isPaid ? "paid" : ""}`}
        onClick={() => setOpen(true)}
        style={{
          background: colors.bg,
          border: isPaid ? "2px solid #10b981" : `1px solid ${colors.border}`,
          opacity: isCancelled ? 0.7 : 1,
          filter: isCancelled ? "grayscale(80%)" : "none",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "16px",
          textAlign: "left"
        }}
        aria-label={`View ${meal.mealType} menu`}
      >
        <div className="meal-tile-icon" style={{ color: colors.icon, marginBottom: "8px" }}>{MEAL_ICONS[meal.mealType]}</div>
        <div className="meal-tile-name" style={{ color: colors.text, fontWeight: 700, fontSize: "1.1rem" }}>{meal.mealType}</div>
        <div className="meal-tile-count" style={{ color: colors.text, opacity: 0.8, fontSize: "0.85rem" }}>
          {meal.items.length} dishes
          {hasNonVeg && <span className="meal-tile-nonveg-dot" style={{ background: "#ef4444" }} title="Non-veg available" />}
        </div>
        {isCancelled && <div className="meal-tile-status" style={{color:"#b91c1c", fontSize:"0.7rem", marginTop:"4px", fontWeight: 700}}>Cancelled</div>}
        {isPaid && <div className="meal-tile-status paid" style={{color:"#047857", fontSize:"0.7rem", marginTop:"4px", fontWeight: 700}}>Purchased</div>}
        <div className="meal-tile-hint" style={{ marginTop: "auto", color: colors.text, opacity: 0.6, fontSize: "0.75rem" }}>View menu →</div>
      </button>

      {open && (
        <MealModal
          meal={meal}
          dietaryPref={dietaryPref}
          nutritionMap={nutritionMap}
          onClose={() => setOpen(false)}
          isTomorrow={isTomorrow}
          isCancelled={isCancelled}
          isPaid={isPaid}
          isStaff={isStaff}
          isHosteller={isHosteller}
          handleToggleMeal={handleToggleMeal}
          setNvModal={setNvModal}
          nonVegBookings={nonVegBookings}
        />
      )}
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState("");
  const [adminStats, setAdminStats] = useState(null);
  const [nutritionMap, setNutritionMap] = useState({});
  const [nvModal, setNvModal] = useState(null);

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
      const res = await axios.post("https://mess-portal-server.onrender.com/api/complaints", fd, {
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
    nonVegBookings: [],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchMenu(parsedUser.id || parsedUser._id);
      
      // Fetch latest settings to keep role and residencyStatus in sync with admin changes
      axios.get(`https://mess-portal-server.onrender.com/api/auth/settings?studentId=${parsedUser.id || parsedUser._id}`)
        .then(res => {
          if (res.data.success && res.data.settings) {
            const updatedUser = { ...parsedUser, ...res.data.settings };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        })
        .catch(err => console.error("Error fetching latest user details:", err));

      axios.get("https://mess-portal-server.onrender.com/api/nutrition").then(res => {
        if (res.data.success) {
          const map = {};
          res.data.nutrition.forEach(d => { map[d.name.toLowerCase()] = d; });
          setNutritionMap(map);
        }
      }).catch(() => {});

      axios.get("https://mess-portal-server.onrender.com/api/admin/notice").then((res) => {
        if (res.data.notice && res.data.notice.message) {
          setNotice(res.data.notice.message);
        }
      }).catch((err) => console.log("Notice Error:", err));

      const role = parsedUser.role || "student";
      const staff = ["admin", "contractor", "accountant"].includes(role);
      
      if (staff) {
        axios.get("https://mess-portal-server.onrender.com/api/admin/headcount").then(res => {
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
      const res = await axios.get(`https://mess-portal-server.onrender.com/api/dashboard/data?studentId=${studentId}`);
      if (res.data.success) {
        setMenuData({
          todayMenu: res.data.todayMenu,
          tomorrowMenu: res.data.tomorrowMenu,
          fullMenu: res.data.fullMenu || [],
          todayName: res.data.todayName,
          tomorrowName: res.data.tomorrowName,
          skipStats: res.data.skipStats,
          tomorrowBookings: res.data.tomorrowBookings,
          nonVegBookings: res.data.nonVegBookings || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    }
  };

  const handleToggleMeal = async (mealType, currentStatus) => {
    const newStatus = currentStatus === "Cancelled" ? "Booked" : "Cancelled";
    if (currentStatus === "Paid") { return; }
    const studentId = user.id || user._id;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const res = await axios.post("https://mess-portal-server.onrender.com/api/dashboard/toggle", {
        studentId: studentId,
        date: tomorrow,
        mealType: mealType,
        status: currentStatus === "Paid" ? "Paid" : newStatus, 
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchMenu(studentId);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred.");
      }
    }
  };

  if (!user) return <div style={{ textAlign: "center", marginTop: "50px", fontSize: "20px" }}>Loading Portal...</div>;

  const userName = user.name || "Student";
  const userEmail = user.email || "No Email";
  const userId = user.id || user._id || "NO_ID_FOUND";
  const userRole = user.role || "student";
  const isStaff = ["admin", "contractor", "accountant"].includes(userRole);
  const isHosteller = user.residencyStatus === "Hosteller";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userId}`;
  const dietaryPref = user.dietaryPreference || "";

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
      alert("QR Code link copied to clipboard!");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <Navbar />

        {notice && (
          <div className="notice-banner">
            <div className="notice-banner-icon">📢</div>
            <p className="notice-text-content">
              <span className="notice-badge">Alert Notice</span>
              {notice}
            </p>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-left">
            {!isStaff ? (
              <>
                <div className="id-card">
                  <h3 className="id-card-heading">JKLU MESS PASS</h3>
                  <p className="id-card-subtitle">Present this QR at the scanner</p>
                  <div className="qr-frame">
                    <img src={qrCodeUrl} alt="QR Code" />
                  </div>
                  <h2 className="id-card-name">{userName}</h2>
                  <p className="id-card-email">{userEmail}</p>

                  {/* --- Today's Special Orders for Staff Verification --- */}
                  {menuData.nonVegBookings?.some(b => new Date(b.date).toDateString() === new Date().toDateString()) && (
                    <div style={{ marginTop: "15px", padding: "10px", background: "white", borderRadius: "12px", border: "1px dashed #ee8310", textAlign: "left" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "0.7rem", fontWeight: 800, color: "#9a3412", textTransform: "uppercase" }}>
                        ✨ Today's Special Orders
                      </p>
                      {menuData.nonVegBookings
                        .filter(b => new Date(b.date).toDateString() === new Date().toDateString())
                        .map((b, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#1e293b", fontWeight: 600, padding: "2px 0" }}>
                            <span>{b.mealType}: {b.item}</span>
                            <span style={{ color: "#10b981" }}>✅ PAID</span>
                          </div>
                        ))}
                    </div>
                  )}

                  <button onClick={handleSharePass} className="btn-share-pass" style={{marginTop:'15px',background:'#f1f5f9',border:'1px solid #cbd5e1',padding:'8px 16px',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',color:'#475569',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',width:'100%'}}>📤 Share Pass</button>
                </div>

                {isHosteller && menuData.skipStats && (
                  <div className="skip-stats-card">
                    <h3> Monthly Skips Remaining</h3>
                    {Object.keys(menuData.skipStats).map((mealType) => (
                      <div key={mealType} className="skip-stat-row">
                        <span className="skip-stat-label">{mealType}</span>
                        <span style={{ color: menuData.skipStats[mealType].remaining === 0 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                          {menuData.skipStats[mealType].remaining} / {menuData.skipStats[mealType].limit}
                        </span>
                      </div>
                    ))}
                    <p className="skip-stat-note">*Skipped meals will be credited to your rebate account at month end.</p>
                  </div>
                )}
                {!isHosteller && (
                  <div className="skip-stats-card" style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ color: '#0f172a', marginBottom: '10px' }}>💳 Day-Scholar Wallet</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>Purchase meals for tomorrow using your portal. Purchased meals will activate your QR code at the scanner.</p>
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

          <div className="dashboard-right">
            <div className="menu-card">
              <h3 className="menu-card-title">Today ({menuData.todayName})</h3>
              <div className="meal-tiles-grid">
                {menuData.todayMenu.length > 0 ? (
                  [...menuData.todayMenu]
                    .sort((a, b) => MEAL_ORDER[a.mealType] - MEAL_ORDER[b.mealType])
                    .map((meal, index) => (
                      <MealTile
                        key={index}
                        meal={meal}
                        dietaryPref={dietaryPref}
                        nutritionMap={nutritionMap}
                        isTomorrow={false}
                        nonVegBookings={menuData.nonVegBookings}
                      />
                    ))
                ) : (
                  <p className="menu-empty">No menu uploaded for today.</p>
                )}
              </div>
            </div>

            <div className="menu-card-bordered">
              <div className="tomorrow-header">
                <h3> Tomorrow ({menuData.tomorrowName})</h3>
                {!isStaff && <span className="manage-badge">Manage Meals</span>}
              </div>

              <div className="meal-tiles-grid">
                {menuData.tomorrowMenu.length > 0 ? (
                  [...menuData.tomorrowMenu]
                    .sort((a, b) => MEAL_ORDER[a.mealType] - MEAL_ORDER[b.mealType])
                    .map((meal, index) => {
                      const isCancelled = menuData.tomorrowBookings.some(b => b.mealType === meal.mealType && b.status === "Cancelled");
                      const isPaid = menuData.tomorrowBookings.some(b => b.mealType === meal.mealType && b.status === "Paid");

                      return (
                        <MealTile
                          key={index}
                          meal={meal}
                          dietaryPref={dietaryPref}
                          nutritionMap={nutritionMap}
                          isTomorrow={true}
                          isCancelled={isCancelled}
                          isPaid={isPaid}
                          isStaff={isStaff}
                          isHosteller={isHosteller}
                          handleToggleMeal={handleToggleMeal}
                          setNvModal={setNvModal}
                          nonVegBookings={menuData.nonVegBookings}
                        />
                      );
                    })
                ) : (
                  <p className="menu-empty">No menu uploaded for tomorrow.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {nvModal && user && (
          <NonVegBookingModal
            item={nvModal.item}
            mealType={nvModal.mealType}
            tomorrowDate={nvModal.tomorrowDate}
            user={user}
            onClose={() => setNvModal(null)}
            onSuccess={() => setNvModal(null)}
          />
        )}

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
