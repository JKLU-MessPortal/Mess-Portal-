import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./MenuPage.css";

const MEAL_ORDER = { Breakfast: 1, Lunch: 2, Snacks: 3, Dinner: 4 };
const MEAL_ICONS = { Breakfast: "🌅", Lunch: "☀️", Snacks: "🍵", Dinner: "🌙" };
const EGG_KEYWORDS = ["egg", "omelette", "omlette", "boiled egg", "anda", "bhurji"];
const isEggItem = (item) => EGG_KEYWORDS.some((kw) => item.toLowerCase().includes(kw));
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_ABBR = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

// ─── Nutrition Bar ────────────────────────────────────────────────
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

// ─── Dish Row (clickable, expands to show nutrition) ──────────────
function DishRow({ dishName, nutritionMap, isNonVeg = false }) {
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
      {/* Dish name row — always visible */}
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
        <span style={{ fontSize: "0.86rem", color: textColor, fontWeight: 600 }}>
          {isNonVeg ? "🍗" : "🍽️"} {dishName}
        </span>
        {match && (
          <span style={{
            fontSize: "0.68rem", fontWeight: 700,
            color: open ? "#f59e0b" : "#94a3b8",
            transition: "color 0.2s",
            display: "flex", alignItems: "center", gap: "3px"
          }}>
            {open ? "▲ Hide" : "ℹ️ Nutrition"}
          </span>
        )}
      </button>

      {/* Nutrition panel — shown when open */}
      {open && match && (
        <div style={{
          background: "white", border: `1px solid ${rowBorder}`,
          borderTop: "none", borderRadius: "0 0 10px 10px",
          padding: "14px", animation: "fadeIn 0.2s ease"
        }}>
          {/* Serving info */}
          <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📏</span>
            <span>Per serving: <strong style={{ color: "#475569" }}>{match.quantity_unit}</strong></span>
          </div>

          {/* Calorie Hero */}
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

          <NutritionBar label="💪 Protein" value={match.protein} max={30} color="#10b981" />
          <NutritionBar label="🌾 Carbohydrates" value={match.carbohydrate} max={80} color="#3b82f6" />
          <NutritionBar label="🫒 Fat" value={match.fat} max={30} color="#f59e0b" />
          <NutritionBar label="🌿 Dietary Fibre" value={match.fibre} max={10} color="#8b5cf6" />
          <NutritionBar label="🍬 Free Sugar" value={match.free_sugar} max={20} color="#ec4899" />
        </div>
      )}
    </div>
  );
}

// ─── Expandable Meal Card ─────────────────────────────────────────
function MealCard({ meal, dietaryPref, nutritionMap, isToday }) {
  const [expanded, setExpanded] = useState(false);

  const filterNonVeg = (items = []) => {
    if (!items || items.length === 0) return [];
    if (dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)") return [];
    if (dietaryPref === "Eggetarian") return items.filter(isEggItem);
    return items;
  };

  const visibleNonVeg = filterNonVeg(meal.nonVegItems);
  const hasNonVeg = visibleNonVeg.length > 0;
  const rawHasNonVeg = meal.nonVegItems && meal.nonVegItems.length > 0;

  return (
    <div style={{
      border: expanded ? "2px solid #f59e0b" : "1px solid #e2e8f0",
      borderRadius: "16px", overflow: "visible",
      background: "white",
      boxShadow: expanded ? "0 8px 28px rgba(245,158,11,0.18)" : "0 2px 8px rgba(0,0,0,0.06)",
      transition: "all 0.3s ease", marginBottom: "14px",
    }}>
      {/* ── Meal Header (click to expand/collapse) ── */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "16px 18px", textAlign: "left",
          display: "flex", alignItems: "center", gap: "14px", fontFamily: "inherit"
        }}
      >
        {/* Icon */}
        <span style={{
          fontSize: "1.7rem", background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          borderRadius: "12px", width: "46px", height: "46px",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          {MEAL_ICONS[meal.mealType]}
        </span>

        {/* Text info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>{meal.mealType}</span>
            {isToday && (
              <span style={{ background: "#10b981", color: "white", fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: "999px" }}>TODAY</span>
            )}
            {rawHasNonVeg && hasNonVeg && (
              <span style={{
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: "white", fontSize: "0.62rem", fontWeight: 700,
                padding: "2px 8px", borderRadius: "999px"
              }}>
                ⭐ Non-Veg Today
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {meal.items.slice(0, 3).join(", ")}{meal.items.length > 3 ? ` +${meal.items.length - 3} more` : ""}
          </p>
        </div>

        {/* Chevron */}
        <span style={{
          fontSize: "1rem", color: "#f59e0b", flexShrink: 0,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease"
        }}>▾</span>
      </button>

      {/* ── Expanded Content ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f8fafc", padding: "14px 18px 18px", background: "#fafafa", borderRadius: "0 0 16px 16px" }}>

          {/* Veg Section */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: hasNonVeg ? "12px" : 0 }}>
            <div style={{ fontWeight: 700, color: "#15803d", fontSize: "0.82rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              🟢 Vegetarian Items
              <span style={{ fontWeight: 400, color: "#64748b", fontSize: "0.73rem" }}>— click a dish for nutrition</span>
            </div>
            {meal.items.map((item, i) => (
              <DishRow key={i} dishName={item} nutritionMap={nutritionMap} isNonVeg={false} />
            ))}
          </div>

          {/* Non-Veg Section */}
          {hasNonVeg && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontWeight: 700, color: "#b91c1c", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "6px" }}>
                  🔴 Non-Veg Items
                </div>
                <span style={{
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "white", fontSize: "0.65rem", fontWeight: 700,
                  padding: "3px 10px", borderRadius: "999px",
                  boxShadow: "0 2px 6px rgba(239,68,68,0.25)"
                }}>
                  💳 Extra Payment Required
                </span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "#9f1239", background: "#ffe4e6", borderRadius: "8px", padding: "6px 10px", marginBottom: "10px" }}>
                ⚠️ Non-veg dishes are prepared separately and charged additionally at the mess counter.
              </p>
              {visibleNonVeg.map((item, i) => (
                <DishRow key={i} dishName={item} nutritionMap={nutritionMap} isNonVeg={true} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main MenuPage ────────────────────────────────────────────────
export default function MenuPage() {
  const [fullMenu, setFullMenu] = useState([]);
  const [nutritionMap, setNutritionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const dietaryPref = storedUser.dietaryPreference || "";

  const todayIdx = new Date().getDay();
  const todayName = DAYS[todayIdx === 0 ? 6 : todayIdx - 1];

  useEffect(() => {
    setSelectedDay(todayName);
    fetchMenu();
    fetchNutrition();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/data");
      if (res.data.success) setFullMenu(res.data.fullMenu || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchNutrition = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/nutrition");
      if (res.data.success) {
        const map = {};
        res.data.nutrition.forEach(d => { map[d.name.toLowerCase()] = d; });
        setNutritionMap(map);
      }
    } catch (e) { console.error(e); }
  };

  const selectedMeals = [...fullMenu.filter(m => m.dayOfWeek === selectedDay)]
    .sort((a, b) => MEAL_ORDER[a.mealType] - MEAL_ORDER[b.mealType]);

  return (
    <div className="menu-page">
      <div className="menu-container">
        <Navbar />

        <div className="menu-hero">
          <h1 className="menu-hero-title">🍲 Mess Menu</h1>
          <p className="menu-hero-sub">Tap a meal to see its dishes. Tap a dish to see its nutrition info.</p>
        </div>

        {/* Dietary Banner */}
        {(dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)" || dietaryPref === "Eggetarian") && (
          <div className="diet-banner">
            <span style={{ fontSize: "1.3rem" }}>
              {dietaryPref === "Eggetarian" ? "🥚" : dietaryPref === "Strict-Vegetarian (Jain Food)" ? "🌿" : "🥦"}
            </span>
            <span>
              <strong>Dietary Filter ON — </strong>
              {dietaryPref === "Vegetarian" && "Non-veg items are hidden."}
              {dietaryPref === "Strict-Vegetarian (Jain Food)" && "Showing Jain-friendly menu only."}
              {dietaryPref === "Eggetarian" && "Showing egg items only from non-veg."}
              {" "}<span style={{ fontSize: "0.78rem", opacity: 0.7 }}>(Settings → Dietary Preference)</span>
            </span>
          </div>
        )}

        {/* Day Tabs */}
        <div className="day-tabs">
          {DAYS.map((day, i) => {
            const isToday = day === todayName;
            const isSelected = day === selectedDay;
            const hasMeals = fullMenu.some(m => m.dayOfWeek === day);
            const hasNonVeg = fullMenu.some(m => m.dayOfWeek === day && m.nonVegItems?.length > 0);
            return (
              <button
                key={day}
                className={`day-tab ${isSelected ? "day-tab--active" : ""} ${isToday ? "day-tab--today" : ""}`}
                onClick={() => setSelectedDay(day)}
                disabled={!hasMeals}
              >
                <span className="day-tab-abbr">{DAY_ABBR[i]}</span>
                {isToday && <span className="day-tab-dot day-tab-dot--today" />}
                {hasNonVeg && !isToday && <span className="day-tab-dot day-tab-dot--nonveg" title="Non-veg available" />}
              </button>
            );
          })}
        </div>

        {/* Meal Cards */}
        <div className="meal-cards-area">
          {loading ? (
            <div className="menu-loading">Loading menu...</div>
          ) : selectedMeals.length === 0 ? (
            <div className="menu-empty-state">
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🍽️</div>
              <p>No menu uploaded for {selectedDay} yet.</p>
              <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Ask the admin to update it.</p>
            </div>
          ) : (
            selectedMeals.map((meal, idx) => (
              <MealCard key={idx} meal={meal} dietaryPref={dietaryPref} nutritionMap={nutritionMap} isToday={selectedDay === todayName} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
