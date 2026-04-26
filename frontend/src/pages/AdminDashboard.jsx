import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DishSearchInput from "../components/DishSearchInput";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("broadcast");

  // Form State
  const [day, setDay] = useState("Monday");
  const [meal, setMeal] = useState("Breakfast");
  const [vegDishes, setVegDishes] = useState([]);      // array of dish name strings
  const [nonVegDishes, setNonVegDishes] = useState([]); // array of dish name strings
  const [statusMsg, setStatusMsg] = useState("");

  // Data State
  const [stats, setStats] = useState({ Breakfast: 0, Lunch: 0, Snacks: 0, Dinner: 0 });
  const [totalSaved, setTotalSaved] = useState(0);
  const [ledger, setLedger] = useState([]);
  const [openStudentIndex, setOpenStudentIndex] = useState(null);

  // ── Complaints ────────────────────────────────────────────
  const [complaints, setComplaints]           = useState([]);
  const [complaintSearch, setComplaintSearch] = useState("");
  const [complaintFrom, setComplaintFrom]     = useState("");
  const [complaintTo, setComplaintTo]         = useState("");
  const [complaintLoading, setComplaintLoading] = useState(false);

  const fetchComplaints = async (search = "", from = "", to = "") => {
    setComplaintLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (from) params.append("from", from);
      if (to)   params.append("to",   to);
      const res = await axios.get(`http://localhost:5000/api/complaints?${params}`);
      if (res.data.success) setComplaints(res.data.complaints);
    } catch (e) { console.error(e); }
    finally { setComplaintLoading(false); }
  };

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
        fetchAdminData(parsedUser.role);
        // Set default active section by role
        if (parsedUser.role === "accountant") setActiveSection("ledger");
        else if (parsedUser.role === "contractor") setActiveSection("broadcast");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchAdminData = async (role) => {
    try {
      const resStats = await axios.get("http://localhost:5000/api/admin/headcount");
      if (resStats.data.success) { setStats(resStats.data.stats); setTotalSaved(resStats.data.totalSaved); }

      const resLedger = await axios.get("http://localhost:5000/api/admin/ledger");
      if (resLedger.data.success) setLedger(resLedger.data.ledger);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    if (vegDishes.length === 0) { setStatusMsg("❌ Add at least one veg item."); return; }
    setStatusMsg("Updating...");
    try {
      const res = await axios.post("http://localhost:5000/api/admin/menu", {
        dayOfWeek: day, mealType: meal,
        items: vegDishes,
        nonVegItems: nonVegDishes,
      });
      if (res.data.success) {
        setStatusMsg("✅ Success: " + meal + " on " + day + " updated!");
        setVegDishes([]); setNonVegDishes([]);
      }
    } catch { setStatusMsg("❌ Failed to update menu."); }
  };

  const handleExportCSV = () => {
    let csv = "data:text/csv;charset=utf-8,Student Name,Email,Total Skips,Meal Details\n";
    ledger.forEach((s) => { csv += `${s.name},${s.email},${s.totalCancelled},${s.meals.join(" | ")}\r\n`; });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Refund_Ledger_${new Date().toLocaleString("en-US", { month: "short" })}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (!user) return <div className="admin-loading">Loading Admin Portal...</div>;

  const canSeeKitchenControls = user.role === "admin" || user.role === "contractor";
  const canSeeFinancials = user.role === "admin" || user.role === "accountant";

  // Nav items based on role
  const navItems = [
    ...(canSeeKitchenControls ? [{ id: "broadcast", icon: "📢", label: "Broadcast Notice" }] : []),
    ...(canSeeKitchenControls ? [{ id: "menu", icon: "🍽️", label: "Update Menu" }] : []),
    ...(canSeeKitchenControls ? [{ id: "headcount", icon: "📊", label: "Kitchen Headcount" }] : []),
    ...(canSeeFinancials ? [{ id: "ledger", icon: "💰", label: "Refund Ledger" }] : []),
    { id: "complaints", icon: "🚨", label: "Complaints" },
  ];

  // Section title/subtitle map
  const sectionMeta = {
    broadcast:  { title: "📢 Broadcast Notice",           sub: "Send an alert message to all students' dashboards." },
    menu:       { title: "🍽️ Update Mess Menu",            sub: "Change today's food offerings for any day." },
    headcount:  { title: "📊 Tomorrow's Kitchen Headcount", sub: "Live headcount of meals skipped to help avoid food wastage." },
    ledger:     { title: "💰 Monthly Refund Ledger",      sub: "List of students who cancelled meals this month." },
    complaints: { title: "🚨 Student Complaints",          sub: "Browse, search and filter complaints raised by students." },
  };


  return (
    <div className="admin-container">

      {/* ── TOP BAR ── */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <span className="admin-topbar-logo">JKLU <span>Mess</span> Portal</span>
          <span className="admin-role-pill">👨‍💻 {user.role}</span>
        </div>
        <button onClick={() => navigate("/dashboard")} className="btn-back">
          ← Back to Dashboard
        </button>
      </div>

      {/* ── BODY ── */}
      <div className="admin-body">

        {/* ── SIDEBAR ── */}
        <nav className="admin-sidebar">
          <div className="sidebar-section-label">Admin Controls</div>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => { setActiveSection(item.id); if (item.id === "complaints") fetchComplaints(); }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* ── MAIN PANEL ── */}
        <main className="admin-main">
          <div className="section-page-title">
            <h2>{sectionMeta[activeSection]?.title}</h2>
            <p>{sectionMeta[activeSection]?.sub}</p>
          </div>

          {/* ══ BROADCAST NOTICE ══ */}
          {activeSection === "broadcast" && canSeeKitchenControls && (
            <div className="admin-card card-red-top">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const msg = e.target.noticeMsg.value;
                try {
                  await axios.post("http://localhost:5000/api/admin/notice", { message: msg });
                  alert("✅ Notice sent to all students!");
                  e.target.reset();
                } catch { alert("❌ Failed to send notice"); }
              }}>
                <div className="form-group">
                  <label className="form-label">Notice Message</label>
                  <textarea
                    name="noticeMsg"
                    required
                    className="form-control"
                    placeholder="Type important notice here (e.g. Special menu today, timings changed)..."
                    style={{ minHeight: "100px" }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ backgroundColor: "#ef4444", boxShadow: "0 3px 10px rgba(239,68,68,0.3)" }}>
                  🚀 Send Notice to All Students
                </button>
              </form>
            </div>
          )}

          {/* ══ UPDATE MENU ══ */}
          {activeSection === "menu" && canSeeKitchenControls && (
            <div className="admin-card">
              <form onSubmit={handleUpdateMenu} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div className="form-group">
                  <label className="form-label">Select Day</label>
                  <select value={day} onChange={(e) => setDay(e.target.value)} className="form-control">
                    {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Select Meal</label>
                  <select value={meal} onChange={(e) => setMeal(e.target.value)} className="form-control">
                    {["Breakfast","Lunch","Snacks","Dinner"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>

                {/* 🟢 Veg Items — fuzzy dish search */}
                <DishSearchInput
                  label="🟢 Veg Items"
                  selectedDishes={vegDishes}
                  onAdd={(name) => setVegDishes(prev => prev.includes(name) ? prev : [...prev, name])}
                  onRemove={(name) => setVegDishes(prev => prev.filter(d => d !== name))}
                />

                {/* 🔴 Non-Veg Items — fuzzy dish search (chicken / egg / mutton only) */}
                <DishSearchInput
                  label="🔴 Non-Veg Items (optional)"
                  selectedDishes={nonVegDishes}
                  nonVeg={true}
                  onAdd={(name) => setNonVegDishes(prev => prev.includes(name) ? prev : [...prev, name])}
                  onRemove={(name) => setNonVegDishes(prev => prev.filter(d => d !== name))}
                />

                <button type="submit" className="btn-primary">🍽️ Update Menu</button>
                {statusMsg && (
                  <div className={`status-msg ${statusMsg.includes("✅") ? "success" : "error"}`}>
                    {statusMsg}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ══ KITCHEN HEADCOUNT ══ */}
          {activeSection === "headcount" && canSeeKitchenControls && (
            <div className="admin-card card-orange-top">
              <div className="stats-grid">
                {Object.keys(stats).map((mealType) => (
                  <div key={mealType} className="stat-box">
                    <h3>{mealType}</h3>
                    <span className="stat-value" style={{ color: stats[mealType] > 0 ? "#ef4444" : "#10b981" }}>
                      {stats[mealType]}
                    </span>
                    <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px" }}>
                      Cancelled
                    </span>
                  </div>
                ))}
              </div>
              <div className="stat-saved-banner">
                🥗 Total Meals Saved Tomorrow: {totalSaved}
              </div>
            </div>
          )}

          {/* ══ REFUND LEDGER ══ */}
          {activeSection === "ledger" && canSeeFinancials && (
            <div className="admin-card card-green-top">
              <div className="ledger-header-flex">
                <div />
                <button onClick={handleExportCSV} className="btn-export" disabled={ledger.length === 0}>
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
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span className="badge-red">{student.totalCancelled} Meals Skipped</span>
                            <span style={{ fontSize: "13px", color: "#94a3b8" }}>{isOpen ? "🔼" : "🔽"}</span>
                          </div>
                        </div>
                        {isOpen && (
                          <div className="accordion-body">
                            <h4>Cancellation Records:</h4>
                            <div className="meal-grid">
                              {student.meals.map((m, i) => (
                                <div key={i} className="meal-pill">🚫 {m}</div>
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

          {/* ══ COMPLAINTS ══ */}
          {activeSection === "complaints" && (
            <div className="admin-card">
              {/* Filters */}
              <div className="cmp-filters">
                <div className="cmp-search-wrap">
                  <span className="cmp-search-icon">🔍</span>
                  <input
                    className="cmp-search"
                    type="text"
                    placeholder="Search by student name…"
                    value={complaintSearch}
                    onChange={e => setComplaintSearch(e.target.value)}
                  />
                </div>
                <div className="cmp-date-wrap">
                  <label className="cmp-date-label">From</label>
                  <input className="cmp-date-input" type="date" value={complaintFrom} onChange={e => setComplaintFrom(e.target.value)} />
                  <label className="cmp-date-label">To</label>
                  <input className="cmp-date-input" type="date" value={complaintTo} onChange={e => setComplaintTo(e.target.value)} />
                </div>
                <button
                  className="cmp-btn-search"
                  onClick={() => fetchComplaints(complaintSearch, complaintFrom, complaintTo)}
                >
                  🔍 Search
                </button>
                <button className="cmp-btn-reset" onClick={() => {
                  setComplaintSearch(""); setComplaintFrom(""); setComplaintTo("");
                  fetchComplaints("", "", "");
                }}>↺ Reset</button>
              </div>

              {complaintLoading && <p className="cmp-loading">Loading complaints…</p>}

              {!complaintLoading && complaints.length === 0 && (
                <p className="empty-msg">No complaints found.</p>
              )}

              {/* count badge */}
              {!complaintLoading && complaints.length > 0 && (
                <p className="cmp-count">{complaints.length} complaint{complaints.length !== 1 ? "s" : ""} found</p>
              )}

              <div className="cmp-list">
                {complaints.map((c, i) => (
                  <div key={c._id || i} className="cmp-card">
                    {/* Card header — avatar + name + date */}
                    <div className="cmp-card-top">
                      <div className="cmp-avatar">{c.studentName?.charAt(0).toUpperCase()}</div>
                      <div className="cmp-info">
                        <span className="cmp-name">{c.studentName}</span>
                        <span className="cmp-date">
                          🕐 {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </div>
                      {c.image
                        ? <span className="cmp-has-photo">📸 Photo</span>
                        : <span className="cmp-no-photo">No photo</span>}
                    </div>

                    {/* Card body — text left, image right */}
                    <div className="cmp-body">
                      <p className="cmp-text">{c.text}</p>
                      {c.image && (
                        <a
                          href={`http://localhost:5000/uploads/${c.image}`}
                          target="_blank" rel="noreferrer"
                          className="cmp-proof-link"
                          title="Click to view full image"
                        >
                          <img
                            src={`http://localhost:5000/uploads/${c.image}`}
                            alt="Proof"
                            className="cmp-proof-img"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}