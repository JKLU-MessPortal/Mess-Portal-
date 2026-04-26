import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };

const EGG_KEYWORDS = ["egg", "omelette", "omlette", "boiled egg", "anda", "bhurji"];
const isEggItem = (item) => EGG_KEYWORDS.some((kw) => item.toLowerCase().includes(kw));

// ------- Nutrition Tooltip Component -------
function NutritionBadge({ dishName, nutritionMap }) {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  // Fuzzy match: dishName contains any key or any key contains dishName
  const query = dishName.toLowerCase().trim();
  const match =
    nutritionMap[query] ||
    Object.values(nutritionMap).find(
      (d) => d.name.toLowerCase().includes(query) || query.includes(d.name.toLowerCase())
    );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    if (show) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [show]);

  if (!match) return null; // Don't show badge if no data

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-block", marginLeft: "6px" }}>
      <button
        onClick={() => setShow((s) => !s)}
        title={`View nutrition for ${dishName}`}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.75rem", color: "#6366f1", fontWeight: "700",
          padding: "1px 5px", borderRadius: "999px",
          backgroundColor: "#eef2ff", lineHeight: 1.4
        }}
      >
        ℹ️
      </button>
      {show && (
        <div style={{
          position: "absolute", left: "0", top: "calc(100% + 6px)", zIndex: 999,
          background: "white", borderRadius: "10px", padding: "12px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)", minWidth: "200px",
          border: "1px solid #e2e8f0", fontSize: "0.82rem"
        }}>
          <div style={{ fontWeight: "700", color: "#1e293b", marginBottom: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px" }}>
            🥗 {match.name}
          </div>
          <div style={{ color: "#64748b", fontSize: "0.72rem", marginBottom: "8px" }}>
            📏 Per serving: <strong>{match.quantity_unit}</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
            {[
              { label: "🔥 Calories", value: `${match.calories} kcal`, color: "#f59e0b" },
              { label: "💪 Protein", value: `${match.protein}g`, color: "#10b981" },
              { label: "🌾 Carbs", value: `${match.carbohydrate}g`, color: "#3b82f6" },
              { label: "🫒 Fat", value: `${match.fat}g`, color: "#ef4444" },
              { label: "🌿 Fibre", value: `${match.fibre}g`, color: "#8b5cf6" },
              { label: "🍬 Sugar", value: `${match.free_sugar}g`, color: "#ec4899" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#f8fafc", borderRadius: "6px", padding: "5px 8px",
                display: "flex", flexDirection: "column"
              }}>
                <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{label}</span>
                <span style={{ fontWeight: "700", color, fontSize: "0.82rem" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </span>
  );
}

// ------- Main MenuPage -------
export default function MenuPage() {
  const [fullMenu, setFullMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nutritionMap, setNutritionMap] = useState({});

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const dietaryPref = storedUser.dietaryPreference || "";

  const filterNonVegItems = (nonVegItems = []) => {
    if (!nonVegItems || nonVegItems.length === 0) return [];
    if (dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)") return [];
    if (dietaryPref === "Eggetarian") return nonVegItems.filter(isEggItem);
    return nonVegItems;
  };

  useEffect(() => {
    fetchMenu();
    fetchNutrition();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/data");
      if (res.data.success) setFullMenu(res.data.fullMenu || []);
    } catch (error) {
      console.error("Failed to fetch full menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNutrition = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/nutrition");
      if (res.data.success) {
        // Build a quick lookup map: lowercase name -> dish object
        const map = {};
        res.data.nutrition.forEach((d) => { map[d.name.toLowerCase()] = d; });
        setNutritionMap(map);
      }
    } catch (error) {
      console.error("Failed to fetch nutrition data:", error);
    }
  };

  const allDaysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Helper: render a list of dish items with nutrition badges
  const renderItems = (items, textColor) => (
    <p style={{ margin: 0, color: textColor, fontSize: "0.85rem", lineHeight: "1.8" }}>
      {items.map((item, i) => (
        <span key={i}>
          {item}
          <NutritionBadge dishName={item} nutritionMap={nutritionMap} />
          {i < items.length - 1 && <span style={{ color: "#94a3b8" }}>,  </span>}
        </span>
      ))}
    </p>
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <Navbar />

        <div className="weekly-section" style={{ marginTop: "30px" }}>
          <h3 style={{ fontSize: "1.8rem", textAlign: "center", marginBottom: "8px", color: "#1e293b" }}>
            🍲 Full Weekly Mess Menu
          </h3>

          <p style={{ textAlign: "center", color: "#64748b", marginBottom: "10px", fontSize: "0.82rem" }}>
            Click the <span style={{ background: "#eef2ff", color: "#6366f1", fontWeight: "700", padding: "1px 6px", borderRadius: "999px" }}>ℹ️</span> next to any dish to see its nutrition info.
          </p>

          {/* Dietary Preference Active Banner */}
          {(dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)" || dietaryPref === "Eggetarian") && (
            <div style={{
              background: dietaryPref === "Eggetarian" ? "#fefce8" : "#f0fdf4",
              border: `1px solid ${dietaryPref === "Eggetarian" ? "#fde68a" : "#bbf7d0"}`,
              borderRadius: "10px", padding: "12px 18px", marginBottom: "20px",
              display: "flex", alignItems: "center", gap: "10px",
              fontSize: "0.9rem", color: "#374151"
            }}>
              <span style={{ fontSize: "1.4rem" }}>
                {dietaryPref === "Strict-Vegetarian (Jain Food)" ? "🌿" : dietaryPref === "Eggetarian" ? "🥚" : "🥦"}
              </span>
              <span>
                <strong>Dietary Filter Active: </strong>
                {dietaryPref === "Vegetarian" && "Non-veg items are hidden."}
                {dietaryPref === "Strict-Vegetarian (Jain Food)" && "Showing Jain-friendly (strict veg) menu only."}
                {dietaryPref === "Eggetarian" && "Only egg-based non-veg items are shown."}
                {" "}
                <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                  (Change in <strong>Settings → Dietary Preference</strong>)
                </span>
              </span>
            </div>
          )}

          {loading ? (
            <p style={{ textAlign: "center" }}>Loading menu...</p>
          ) : fullMenu.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "12px" }}>
              <p className="weekly-empty" style={{ fontSize: "1.2rem", color: "#64748b" }}>
                The weekly menu has not been uploaded yet.
              </p>
            </div>
          ) : (
            <div className="weekly-grid">
              {allDaysOfWeek.map((day) => {
                const dayMeals = fullMenu.filter((m) => m.dayOfWeek === day);
                if (dayMeals.length === 0) return null;

                return (
                  <div key={day} className="day-card" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: "14px", overflow: "hidden" }}>
                    <h4 style={{
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "white", margin: "0", padding: "12px 16px",
                      fontSize: "1rem", letterSpacing: "0.05em"
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
                              <span style={{
                                display: "inline-block", background: "#fef3c7", color: "#92400e",
                                fontWeight: "700", fontSize: "0.78rem", padding: "2px 10px",
                                borderRadius: "999px", marginBottom: "8px",
                                textTransform: "uppercase", letterSpacing: "0.05em"
                              }}>
                                {meal.mealType}
                              </span>

                              {/* Veg Items */}
                              <div style={{
                                background: "#f0fdf4", border: "1px solid #bbf7d0",
                                borderRadius: "8px", padding: "8px 10px",
                                marginBottom: hasNonVeg ? "6px" : "0"
                              }}>
                                <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#15803d", marginBottom: "3px", textTransform: "uppercase" }}>
                                  🟢 Veg
                                </div>
                                {renderItems(meal.items, "#166534")}
                              </div>

                              {/* Non-Veg Items */}
                              {hasNonVeg && (
                                <div style={{
                                  background: "#fff1f2", border: "1px solid #fecdd3",
                                  borderRadius: "8px", padding: "8px 10px"
                                }}>
                                  <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#b91c1c", marginBottom: "3px", textTransform: "uppercase" }}>
                                    🔴 Non-Veg
                                  </div>
                                  {renderItems(visibleNonVeg, "#9f1239")}
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
