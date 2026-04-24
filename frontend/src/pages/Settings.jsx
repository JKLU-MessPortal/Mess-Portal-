import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Settings.css";

const DIETARY_OPTIONS = [
  { value: "", label: "-- Select Preference --" },
  { value: "Vegetarian", label: "🥦 Vegetarian" },
  { value: "Non-Vegetarian", label: "🍗 Non-Vegetarian" },
  { value: "Eggetarian", label: "🥚 Eggetarian" },
  { value: "Strict-Vegetarian (Jain Food)", label: "🌿 Strict-Vegetarian (Jain Food)" },
];

const RESIDENCY_OPTIONS = [
  { value: "", label: "-- Select Status --" },
  { value: "Hosteller", label: "🏠 Hosteller" },
  { value: "Day-Scholar", label: "🚌 Day-Scholar" },
];

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  // Form fields
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    dietaryPreference: "",
    residencyStatus: "",
    foodAllergies: "",
  });

  // Read-only email pulled from stored user
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    const studentId = parsedUser.id || parsedUser._id;
    setEmail(parsedUser.email || "");

    // Fetch saved settings from server
    axios
      .get(`http://localhost:5000/api/auth/settings?studentId=${studentId}`)
      .then((res) => {
        if (res.data.success) {
          const s = res.data.settings;
          setForm({
            name: s.name || "",
            rollNumber: s.rollNumber || "",
            dietaryPreference: s.dietaryPreference || "",
            residencyStatus: s.residencyStatus || "",
            foodAllergies: s.foodAllergies || "",
          });
        }
      })
      .catch((err) => console.error("Settings fetch error:", err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatusMsg({ text: "", type: "" }); // clear previous msg on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: "", type: "" });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const studentId = storedUser.id || storedUser._id;

    try {
      const res = await axios.put("http://localhost:5000/api/auth/settings", {
        studentId,
        ...form,
      });

      if (res.data.success) {
        // Sync name back into localStorage so Navbar reflects change
        const updatedUser = { ...storedUser, name: form.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setStatusMsg({ text: "✅ Settings saved successfully!", type: "success" });
      }
    } catch (err) {
      console.error("Settings save error:", err);
      setStatusMsg({ text: "❌ Failed to save settings. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-spinner"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <Navbar />

        {/* Page Header */}
        <div className="settings-header">
          <div className="settings-header-icon">⚙️</div>
          <div>
            <h1 className="settings-title">Profile & Preferences</h1>
            <p className="settings-subtitle">
              Manage your personal details and dietary preferences
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">

          {/* ── SECTION 1: Personal Information ── */}
          <div className="settings-card">
            <div className="settings-card-header">
              <span className="settings-card-icon">👤</span>
              <h2 className="settings-card-title">Personal Information</h2>
            </div>

            <div className="settings-fields-grid">
              {/* Full Name */}
              <div className="settings-field">
                <label htmlFor="name" className="settings-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="settings-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Roll Number */}
              <div className="settings-field">
                <label htmlFor="rollNumber" className="settings-label">
                  Roll Number <span className="required-star">*</span>
                </label>
                <input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  required
                  className="settings-input"
                  value={form.rollNumber}
                  onChange={handleChange}
                  placeholder="e.g. 22BTECH10001"
                />
              </div>

              {/* Email (read-only) */}
              <div className="settings-field settings-field-full">
                <label className="settings-label">
                  Institutional Email
                  <span className="readonly-badge">Read-only</span>
                </label>
                <input
                  type="email"
                  className="settings-input settings-input-readonly"
                  value={email}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Residency & Diet ── */}
          <div className="settings-card">
            <div className="settings-card-header">
              <span className="settings-card-icon">🏫</span>
              <h2 className="settings-card-title">Residency & Dietary Details</h2>
            </div>

            <div className="settings-fields-grid">
              {/* Hosteller / Day-Scholar */}
              <div className="settings-field">
                <label htmlFor="residencyStatus" className="settings-label">
                  Residency Status <span className="required-star">*</span>
                </label>
                <div className="settings-select-wrapper">
                  <select
                    id="residencyStatus"
                    name="residencyStatus"
                    required
                    className="settings-select"
                    value={form.residencyStatus}
                    onChange={handleChange}
                  >
                    {RESIDENCY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>

              {/* Dietary Preference */}
              <div className="settings-field">
                <label htmlFor="dietaryPreference" className="settings-label">
                  Dietary Preference <span className="required-star">*</span>
                </label>
                <div className="settings-select-wrapper">
                  <select
                    id="dietaryPreference"
                    name="dietaryPreference"
                    required
                    className="settings-select"
                    value={form.dietaryPreference}
                    onChange={handleChange}
                  >
                    {DIETARY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▾</span>
                </div>
              </div>
            </div>

            {/* Diet preference visual chips */}
            {form.dietaryPreference && (
              <div className="diet-chip-row">
                <span className={`diet-chip diet-chip--${form.dietaryPreference.toLowerCase().replace(/[\s()/]+/g, "-")}`}>
                  {form.dietaryPreference === "Vegetarian" && "🥦 Vegetarian"}
                  {form.dietaryPreference === "Non-Vegetarian" && "🍗 Non-Vegetarian"}
                  {form.dietaryPreference === "Eggetarian" && "🥚 Eggetarian"}
                  {form.dietaryPreference === "Strict-Vegetarian (Jain Food)" && "🌿 Jain Food (Strict Veg)"}
                </span>
                <span className="diet-chip-note">This will help the mess serve you better.</span>
              </div>
            )}
          </div>

          {/* ── SECTION 3: Allergies & Dislikes ── */}
          <div className="settings-card">
            <div className="settings-card-header">
              <span className="settings-card-icon">⚠️</span>
              <h2 className="settings-card-title">Food Allergies & Dislikes</h2>
            </div>
            <p className="settings-card-desc">
              List any food ingredients you are allergic to or strongly dislike.
              This helps the mess administration accommodate your needs.
            </p>
            <textarea
              id="foodAllergies"
              name="foodAllergies"
              className="settings-textarea"
              value={form.foodAllergies}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Peanuts (allergy), Brinjal (dislike), Mustard oil (allergy)..."
            />
            <p className="settings-textarea-hint">
              💡 Separate multiple items with commas for clarity.
            </p>
          </div>

          {/* ── SAVE BUTTON & STATUS ── */}
          <div className="settings-actions">
            {statusMsg.text && (
              <div className={`settings-status-msg settings-status-msg--${statusMsg.type}`}>
                {statusMsg.text}
              </div>
            )}
            <button
              type="submit"
              className="settings-save-btn"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : (
                "💾 Save Settings"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
