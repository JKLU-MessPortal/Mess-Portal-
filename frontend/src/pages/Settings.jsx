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


export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

  // Editable form fields (student controls these)
  const [form, setForm] = useState({
    dietaryPreference: "",
    foodAllergies: "",
  });

  // Read-only fields — admin-controlled or fetched from Microsoft OAuth
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [residencyStatus, setResidencyStatus] = useState("");

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
      .get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/settings?studentId=${studentId}`)
      .then((res) => {
        if (res.data.success) {
          const s = res.data.settings;
          // Populate editable fields
          setForm({
            dietaryPreference: s.dietaryPreference || "",
            foodAllergies: s.foodAllergies || "",
          });
          // Populate admin-locked / OAuth-locked fields (read-only)
          setName(s.name || "");
          setRollNumber(s.rollNumber || "Not assigned yet");
          setResidencyStatus(s.residencyStatus || "Not assigned yet");
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
      // Only send editable fields — name, rollNumber and residencyStatus are locked
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/settings`, {
        studentId,
        dietaryPreference: form.dietaryPreference,
        foodAllergies: form.foodAllergies,
      });

      if (res.data.success) {
        setStatusMsg({ text: "✅ Settings saved successfully!", type: "success" });
        // Update localStorage so the menu filter works immediately without re-login
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({
          ...storedUser,
          dietaryPreference: form.dietaryPreference,
        }));
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
              {/* Full Name — Read-only, from Microsoft OAuth */}
              <div className="settings-field">
                <label className="settings-label">
                  Full Name
                  <span className="readonly-badge">From Microsoft</span>
                </label>
                <input
                  type="text"
                  className="settings-input settings-input-readonly"
                  value={name}
                  readOnly
                  title="Your name is fetched from your Microsoft account and cannot be changed here."
                />
              </div>

              {/* Roll Number — Read-only, set by Admin */}
              <div className="settings-field">
                <label className="settings-label">
                  Roll Number
                  <span className="readonly-badge">Set by Admin</span>
                </label>
                <input
                  type="text"
                  className="settings-input settings-input-readonly"
                  value={rollNumber}
                  readOnly
                  title="Your roll number is assigned by the admin and cannot be changed here."
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
              {/* Residency Status — Read-only, set by Admin */}
              <div className="settings-field">
                <label className="settings-label">
                  Residency Status
                  <span className="readonly-badge">Set by Admin</span>
                </label>
                <input
                  type="text"
                  className={`settings-input settings-input-readonly settings-input-residency--${residencyStatus.toLowerCase().replace(/[^a-z]/g, "-")}`}
                  value={
                    residencyStatus === "Hosteller" ? "🏠 Hosteller" :
                    residencyStatus === "Day-Scholar" ? "🚌 Day-Scholar" :
                    residencyStatus
                  }
                  readOnly
                  title="Your residency status is determined by the admin registration and cannot be changed here."
                />
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
