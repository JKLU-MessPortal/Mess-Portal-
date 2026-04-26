import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };

// Egg-related keywords — Eggetarians can see these, vegetarians cannot
const EGG_KEYWORDS = ["egg", "omelette", "omlette", "boiled egg", "anda", "bhurji"];

const isEggItem = (item) =>
  EGG_KEYWORDS.some((kw) => item.toLowerCase().includes(kw));

export default function MenuPage() {
  const [fullMenu, setFullMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Read dietary preference from stored user profile
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const dietaryPref = storedUser.dietaryPreference || "";

  // Decide what non-veg items to show for this student
  const filterNonVegItems = (nonVegItems = []) => {
    if (!nonVegItems || nonVegItems.length === 0) return [];
    if (dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)") {
      return []; // Show nothing non-veg
    }
    if (dietaryPref === "Eggetarian") {
      return nonVegItems.filter(isEggItem); // Only egg items
    }
    return nonVegItems; // Non-Veg + no pref: show all
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/data");
      if (res.data.success) {
        setFullMenu(res.data.fullMenu || []);
      }
    } catch (error) {
      console.error("Failed to fetch full menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const allDaysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <Navbar />

        <div className="weekly-section" style={{ marginTop: "30px" }}>
          <h3 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: "8px", color: "#1e293b" }}>
            🍲 Full Weekly Mess Menu
          </h3>
          {/* <p style={{ textAlign: "center", color: "#64748b", marginBottom: "30px", fontSize: "0.9rem" }}>
            <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 10px", borderRadius: "999px", marginRight: "10px", fontWeight: "600" }}>🟢 Veg</span>
            <span style={{ background: "#fee2e2", color: "#b91c1c", padding: "2px 10px", borderRadius: "999px", fontWeight: "600" }}>🔴 Non-Veg</span>
          </p> */}

          {/* Dietary Preference Active Banner */}
          {(dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)" || dietaryPref === "Eggetarian") && (
            <div style={{
              background: dietaryPref === "Strict-Vegetarian (Jain Food)" ? "#f0fdf4" : dietaryPref === "Eggetarian" ? "#fefce8" : "#f0fdf4",
              border: `1px solid ${dietaryPref === "Eggetarian" ? "#fde68a" : "#bbf7d0"}`,
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "0.9rem",
              color: "#374151"
            }}>
              <span style={{ fontSize: "1.4rem" }}>
                {dietaryPref === "Strict-Vegetarian (Jain Food)" ? "🌿" : dietaryPref === "Eggetarian" ? "🥚" : "🥦"}
              </span>
              <span>
                <strong>Dietary Filter Active:</strong>{" "}
                {dietaryPref === "Vegetarian" && "Non-veg items are hidden based on your Vegetarian preference."}
                {dietaryPref === "Strict-Vegetarian (Jain Food)" && "Non-veg items are hidden. Showing Jain-friendly (strict vegetarian) menu only."}
                {dietaryPref === "Eggetarian" && "Only egg-based non-veg items are shown. Other non-veg is hidden."}
                {" "}
                <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                  (Change this in <strong>Settings → Dietary Preference</strong>)
                </span>
              </span>
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: "center" }}>Loading menu...</p>
          ) : fullMenu.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <p className="weekly-empty" style={{ fontSize: "1.2rem", color: "#64748b" }}>
                The weekly menu has not been uploaded yet. Please ask an admin to update it.
              </p>
            </div>
          ) : (
            <div className="weekly-grid">
              {allDaysOfWeek.map((day) => {
                const dayMeals = fullMenu.filter((m) => m.dayOfWeek === day);
                if (dayMeals.length === 0) return null;

                return (
                  <div key={day} className="day-card" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: "14px", overflow: "hidden" }}>
                    {/* Day Header */}
                    <h4 style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "white",
                      margin: "0",
                      padding: "12px 16px",
                      fontSize: "1rem",
                      letterSpacing: "0.05em"
                    }}>
                      {day}
                    </h4>

                    <div style={{ padding: "12px" }}>
                      {[...dayMeals]
                        .sort((a, b) => MEAL_ORDER[a.mealType] - MEAL_ORDER[b.mealType])
                        .map((meal, idx) => {
                          const visibleNonVeg = filterNonVegItems(meal.nonVegItems);
                          const hasNonVeg = visibleNonVeg.length > 0;
                          return (
                            <div key={idx} style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: idx < dayMeals.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                              {/* Meal Type Badge */}
                              <span style={{
                                display: "inline-block",
                                background: "#fef3c7",
                                color: "#92400e",
                                fontWeight: "700",
                                fontSize: "0.78rem",
                                padding: "2px 10px",
                                borderRadius: "999px",
                                marginBottom: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                              }}>
                                {meal.mealType}
                              </span>

                              {/* Veg Items */}
                              <div style={{
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                marginBottom: hasNonVeg ? "6px" : "0"
                              }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#15803d", marginBottom: "3px", textTransform: "uppercase" }}>
                                  🟢 Veg
                                </div>
                                <p style={{ margin: 0, color: "#166534", fontSize: "0.85rem" }}>
                                  {meal.items.join(", ")}
                                </p>
                              </div>

                              {/* Non-Veg Items — only if visible after filter */}
                              {hasNonVeg && (
                                <div style={{
                                  background: "#fff1f2",
                                  border: "1px solid #fecdd3",
                                  borderRadius: "8px",
                                  padding: "8px 10px"
                                }}>
                                  <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#b91c1c", marginBottom: "3px", textTransform: "uppercase" }}>
                                    🔴 Non-Veg
                                  </div>
                                  <p style={{ margin: 0, color: "#9f1239", fontSize: "0.85rem" }}>
                                    {visibleNonVeg.join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
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
