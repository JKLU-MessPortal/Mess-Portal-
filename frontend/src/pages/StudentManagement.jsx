import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./StudentManagement.css";

const API = "http://localhost:5000/api/admin";

const ROLES = ["student", "admin", "contractor", "accountant", "controller"];

const ROLE_COLORS = {
  student:    { bg: "#e8f5e9", color: "#2e7d32" },
  admin:      { bg: "#fff3e0", color: "#e65100" },
  contractor: { bg: "#e3f2fd", color: "#1565c0" },
  accountant: { bg: "#f3e5f5", color: "#6a1b9a" },
  controller: { bg: "#fce4ec", color: "#880e4f" },
};

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

  // --- Role management state ---
  const [allUsers, setAllUsers]         = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleSearch, setRoleSearch]     = useState("");
  const [pendingRoles, setPendingRoles] = useState({}); // { userId: newRole }
  const [savingRole, setSavingRole]     = useState("");  // userId currently being saved
  const [roleMsg, setRoleMsg]           = useState({ text: "", type: "" });

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

  // --- Fetch all users for role management ---
  const fetchAllUsers = useCallback(async () => {
    setRolesLoading(true);
    setRoleMsg({ text: "", type: "" });
    try {
      // We call the existing /students endpoint which returns role:'student' users
      // but we need ALL users — let's use a broader fetch via the existing endpoint
      // and supplement with admin users. For now we'll fetch students then show all.
      const res = await axios.get(`${API}/students`);
      // Also fetch the current admin user from localStorage and include them
      const adminUser = JSON.parse(localStorage.getItem("user"));
      const students = res.data.students || [];
      // Combine and deduplicate
      const allMap = {};
      [...students].forEach(u => { allMap[u._id] = u; });
      // Add the admin themselves if not already present
      if (adminUser && !allMap[adminUser.id]) {
        allMap[adminUser.id] = { _id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role };
      }
      setAllUsers(Object.values(allMap));
    } catch (e) {
      console.error("Failed to fetch users:", e);
      setRoleMsg({ text: "❌ Failed to load users.", type: "error" });
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => { fetchHostellers(); }, [fetchHostellers]);
  useEffect(() => { if (activeTab === "roles") fetchAllUsers(); }, [activeTab, fetchAllUsers]);

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

  // --- Role change handler ---
  const handleRoleChange = (userId, newRole) => {
    setPendingRoles(prev => ({ ...prev, [userId]: newRole }));
    setRoleMsg({ text: "", type: "" });
  };

  const handleSaveRole = async (user) => {
    const newRole = pendingRoles[user._id];
    if (!newRole || newRole === user.role) return;

    setSavingRole(user._id);
    setRoleMsg({ text: "", type: "" });
    try {
      const res = await axios.put(`${API}/users/role`, {
        userId: user._id,
        role: newRole,
      });
      if (res.data.success) {
        setRoleMsg({ text: res.data.message, type: "success" });
        // Update local list
        setAllUsers(prev =>
          prev.map(u => u._id === user._id ? { ...u, role: newRole } : u)
        );
        // Clear pending for this user
        setPendingRoles(prev => {
          const copy = { ...prev };
          delete copy[user._id];
          return copy;
        });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update role.";
      setRoleMsg({ text: `❌ ${msg}`, type: "error" });
    } finally {
      setSavingRole("");
    }
  };

  // --- Filtered lists ---
  const filtered = hostellers.filter(
    (h) =>
      h.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(roleSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(roleSearch.toLowerCase())
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
          <button
            id="tab-roles"
            className={`sm-tab ${activeTab === "roles" ? "sm-tab--active" : ""}`}
            onClick={() => { setActiveTab("roles"); }}
          >
            <span className="sm-tab-icon">🔑</span>
            Manage Roles
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
              <div className="sm-stat">
                <span className="sm-stat-num sm-stat-num--blue">∞</span>
                <span className="sm-stat-label">Day-Scholars (all others)</span>
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

        {/* ════════════════════════════════════
            TAB 3 — MANAGE ROLES
        ════════════════════════════════════ */}
        {activeTab === "roles" && (
          <div className="sm-card">
            <div className="sm-card-header">
              <span className="sm-card-icon">🔑</span>
              <div>
                <h2 className="sm-card-title">Manage User Roles</h2>
                <p className="sm-card-desc">
                  Change any user's role. The new role takes effect on their next login.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="sm-search-wrapper">
              <span className="sm-search-icon">🔍</span>
              <input
                type="text"
                className="sm-search"
                placeholder="Search by name or email..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
              />
              {roleSearch && (
                <button className="sm-search-clear" onClick={() => setRoleSearch("")}>✕</button>
              )}
            </div>

            {roleMsg.text && (
              <div className={`sm-msg sm-msg--${roleMsg.type}`}>{roleMsg.text}</div>
            )}

            {rolesLoading ? (
              <div className="sm-list-loading">
                <span className="sm-spinner sm-spinner--dark"></span>
                <span>Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="sm-empty">
                <span className="sm-empty-icon">{roleSearch ? "🔍" : "📭"}</span>
                <p>{roleSearch ? `No results for "${roleSearch}"` : "No users found."}</p>
              </div>
            ) : (
              <div className="sm-table-wrapper">
                <table className="sm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Current Role</th>
                      <th>Change To</th>
                      <th>Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => {
                      const currentRole = u.role || "student";
                      const selectedRole = pendingRoles[u._id] ?? currentRole;
                      const isDirty = selectedRole !== currentRole;
                      const roleStyle = ROLE_COLORS[currentRole] || ROLE_COLORS.student;

                      return (
                        <tr key={u._id} className={savingRole === u._id ? "sm-row--loading" : ""}>
                          <td className="sm-td-num">{idx + 1}</td>
                          <td>
                            <div className="sm-email-cell">
                              <span className="sm-avatar">{(u.name || u.email)[0].toUpperCase()}</span>
                              <span style={{ fontWeight: 600 }}>{u.name || "—"}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "#555" }}>{u.email}</td>
                          <td>
                            <span
                              className="sm-roll-badge"
                              style={{
                                background: roleStyle.bg,
                                color: roleStyle.color,
                                fontWeight: 700,
                                textTransform: "capitalize",
                              }}
                            >
                              {currentRole}
                            </span>
                          </td>
                          <td>
                            <select
                              className="sm-role-select"
                              value={selectedRole}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            >
                              {ROLES.map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <button
                              className={`sm-btn-save ${isDirty ? "sm-btn-save--active" : ""}`}
                              onClick={() => handleSaveRole(u)}
                              disabled={!isDirty || savingRole === u._id}
                            >
                              {savingRole === u._id ? (
                                <><span className="sm-spinner sm-spinner--white"></span> Saving...</>
                              ) : (
                                isDirty ? "💾 Save" : "✓ Saved"
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="sm-table-footer">
                  Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            <div className="sm-info-banner" style={{ marginTop: "1rem" }}>
              <span>⚠️</span>
              <span>
                Role changes take effect the <strong>next time the user logs in</strong> — their browser session will reflect the updated role automatically.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
