import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./StudentManagement.css";

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin`;



export default function StudentManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("register"); // "register" | "deregister" | "roles"

  // --- Registration form state ---
  const [regEmail, setRegEmail]     = useState("");
  const [regRoll, setRegRoll]       = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regMsg, setRegMsg]         = useState({ text: "", type: "" });

  // --- Registry list state ---
  const [hostellers, setHostellers]     = useState([]);
  const [listLoading, setListLoading]   = useState(true);
  const [deregLoading, setDeregLoading] = useState(""); // stores email being deregistered
  const [deregMsg, setDeregMsg]         = useState({ text: "", type: "" });
  const [searchQuery, setSearchQuery]   = useState("");



  // --- Auth guard (admin only) ---
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { navigate("/"); return; }
    const u = JSON.parse(stored);
    if (u.role !== "admin") { navigate("/dashboard"); return; }
  }, [navigate]);

  // --- Fetch hosteller list ---
  const fetchHostellers = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await axios.get(`${API}/hostellers`);
      if (res.data.success) setHostellers(res.data.hostellers);
    } catch (e) {
      console.error("Failed to fetch hostellers:", e);
    } finally {
      setListLoading(false);
    }
  }, []);



  useEffect(() => { fetchHostellers(); }, [fetchHostellers]);

  // --- Register handler ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegMsg({ text: "", type: "" });
    setRegLoading(true);

    const admin = JSON.parse(localStorage.getItem("user"));
    try {
      const res = await axios.post(`${API}/hostellers/register`, {
        email: regEmail.trim().toLowerCase(),
        rollNumber: regRoll.trim().toUpperCase(),
        addedBy: admin?.email || "admin",
      });
      if (res.data.success) {
        setRegMsg({ text: res.data.message, type: "success" });
        setRegEmail("");
        setRegRoll("");
        fetchHostellers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Try again.";
      setRegMsg({ text: `❌ ${msg}`, type: "error" });
    } finally {
      setRegLoading(false);
    }
  };

  // --- De-register handler ---
  const handleDeregister = async (email) => {
    if (!window.confirm(`Remove ${email} from Hosteller registry? They will be treated as Day-Scholar.`)) return;
    setDeregMsg({ text: "", type: "" });
    setDeregLoading(email);

    try {
      const res = await axios.delete(`${API}/hostellers/deregister`, { data: { email } });
      if (res.data.success) {
        setDeregMsg({ text: res.data.message, type: "success" });
        setHostellers((prev) => prev.filter((h) => h.email !== email));
      }
    } catch (err) {
      const msg = err.response?.data?.message || "De-registration failed.";
      setDeregMsg({ text: `❌ ${msg}`, type: "error" });
    } finally {
      setDeregLoading("");
    }
  };



  // --- Filtered lists ---
  const filtered = hostellers.filter(
    (h) =>
      h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="sm-page">
      <div className="sm-container">
        <Navbar />

        {/* Page Header */}
        <div className="sm-header">
          <div className="sm-header-icon">👥</div>
          <div>
            <h1 className="sm-title">Student Management</h1>
            <p className="sm-subtitle">
              Manage the Hosteller registry and user roles.
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="sm-tabs">
          <button
            id="tab-register"
            className={`sm-tab ${activeTab === "register" ? "sm-tab--active" : ""}`}
            onClick={() => { setActiveTab("register"); setRegMsg({ text: "", type: "" }); }}
          >
            <span className="sm-tab-icon">📋</span>
            Register Hosteller
          </button>
          <button
            id="tab-deregister"
            className={`sm-tab ${activeTab === "deregister" ? "sm-tab--active" : ""}`}
            onClick={() => { setActiveTab("deregister"); setDeregMsg({ text: "", type: "" }); }}
          >
            <span className="sm-tab-icon">🗑️</span>
            De-register Hosteller
            <span className="sm-tab-badge">{hostellers.length}</span>
          </button>
        </div>

        {/* ════════════════════════════════════
            TAB 1 — REGISTRATION
        ════════════════════════════════════ */}
        {activeTab === "register" && (
          <div className="sm-card">
            <div className="sm-card-header">
              <span className="sm-card-icon">📋</span>
              <div>
                <h2 className="sm-card-title">Register a New Hosteller</h2>
                <p className="sm-card-desc">
                  Enter the student's JKLU Outlook email and roll number. They will be
                  automatically marked as <strong>Hosteller</strong> the next time they log in.
                </p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="sm-form">
              <div className="sm-fields-grid">
                {/* Email */}
                <div className="sm-field">
                  <label htmlFor="reg-email" className="sm-label">
                    Student Outlook Email <span className="sm-required">*</span>
                  </label>
                  <div className="sm-input-wrapper">
                    <span className="sm-input-icon">✉️</span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      className="sm-input"
                      placeholder="student@jklu.edu.in"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setRegMsg({ text: "", type: "" }); }}
                    />
                  </div>
                  <span className="sm-field-hint">Must end with @jklu.edu.in</span>
                </div>

                {/* Roll Number */}
                <div className="sm-field">
                  <label htmlFor="reg-roll" className="sm-label">
                    Roll Number <span className="sm-required">*</span>
                  </label>
                  <div className="sm-input-wrapper">
                    <span className="sm-input-icon">🎓</span>
                    <input
                      id="reg-roll"
                      type="text"
                      required
                      className="sm-input"
                      placeholder="e.g. 22BTECH10001"
                      value={regRoll}
                      onChange={(e) => { setRegRoll(e.target.value); setRegMsg({ text: "", type: "" }); }}
                    />
                  </div>
                </div>
              </div>

              {/* Info banner */}
              <div className="sm-info-banner">
                <span>ℹ️</span>
                <span>
                  If this student has <strong>already logged in</strong>, their residency status
                  will be updated to <strong>Hosteller</strong> immediately in the database.
                </span>
              </div>

              {regMsg.text && (
                <div className={`sm-msg sm-msg--${regMsg.type}`}>{regMsg.text}</div>
              )}

              <button type="submit" className="sm-btn-primary" disabled={regLoading}>
                {regLoading ? (
                  <><span className="sm-spinner"></span> Registering...</>
                ) : (
                  "✅ Register as Hosteller"
                )}
              </button>
            </form>

            {/* Quick count */}
            <div className="sm-stat-row">
              <div className="sm-stat">
                <span className="sm-stat-num">{hostellers.length}</span>
                <span className="sm-stat-label">Registered Hostellers</span>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB 2 — DE-REGISTRATION
        ════════════════════════════════════ */}
        {activeTab === "deregister" && (
          <div className="sm-card">
            <div className="sm-card-header">
              <span className="sm-card-icon">🗑️</span>
              <div>
                <h2 className="sm-card-title">De-register a Hosteller</h2>
                <p className="sm-card-desc">
                  Remove a student from the Hosteller registry. They will be treated as a{" "}
                  <strong>Day-Scholar</strong> from their next login onwards.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="sm-search-wrapper">
              <span className="sm-search-icon">🔍</span>
              <input
                type="text"
                className="sm-search"
                placeholder="Search by email or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="sm-search-clear" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>

            {deregMsg.text && (
              <div className={`sm-msg sm-msg--${deregMsg.type}`}>{deregMsg.text}</div>
            )}

            {listLoading ? (
              <div className="sm-list-loading">
                <span className="sm-spinner sm-spinner--dark"></span>
                <span>Loading registry...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="sm-empty">
                <span className="sm-empty-icon">{searchQuery ? "🔍" : "📭"}</span>
                <p>{searchQuery ? `No results for "${searchQuery}"` : "No hostellers registered yet."}</p>
              </div>
            ) : (
              <div className="sm-table-wrapper">
                <table className="sm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Email</th>
                      <th>Roll Number</th>
                      <th>Registered On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h, idx) => (
                      <tr key={h._id} className={deregLoading === h.email ? "sm-row--loading" : ""}>
                        <td className="sm-td-num">{idx + 1}</td>
                        <td>
                          <div className="sm-email-cell">
                            <span className="sm-avatar">{h.email[0].toUpperCase()}</span>
                            <span>{h.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className="sm-roll-badge">{h.rollNumber}</span>
                        </td>
                        <td className="sm-date-cell">
                          {new Date(h.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <button
                            className="sm-btn-danger"
                            onClick={() => handleDeregister(h.email)}
                            disabled={deregLoading === h.email}
                          >
                            {deregLoading === h.email ? (
                              <><span className="sm-spinner sm-spinner--white"></span> Removing...</>
                            ) : (
                              "🗑️ Remove"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="sm-table-footer">
                  Showing {filtered.length} of {hostellers.length} entries
                </p>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
}
