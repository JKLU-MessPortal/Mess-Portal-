import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./MenuPage.css";

import { Coffee, Sun, Utensils, Moon, Info, ChevronUp, AlertTriangle, UtensilsCrossed } from "lucide-react";

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
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const DAY_ABBR = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

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
        <span style={{ fontSize: "0.86rem", color: textColor, fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
          {isNonVeg ? <UtensilsCrossed size={16} /> : <Utensils size={16} />} {dishName}
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
function MealModal({ meal, dietaryPref, nutritionMap, onClose }) {
  const colors = MEAL_COLORS[meal.mealType] || MEAL_COLORS.Lunch;

  const filterNonVeg = (items = []) => {
    if (!items || items.length === 0) return [];
    if (dietaryPref === "Vegetarian" || dietaryPref === "Strict-Vegetarian (Jain Food)") return [];
    if (dietaryPref === "Eggetarian") return items.filter(isEggItem);
    return items;
  };

  const visibleNonVeg = filterNonVeg(meal.nonVegItems);
  const hasNonVeg = visibleNonVeg.length > 0;

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={`${meal.mealType} menu`}>
        {/* Modal Header */}
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
              <h2 className="modal-title" style={{ color: colors.text }}>{meal.mealType}</h2>
              <p className="modal-subtitle">{meal.items.length} veg dish{meal.items.length !== 1 ? "es" : ""}{hasNonVeg ? ` · ${visibleNonVeg.length} non-veg` : ""}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Veg Section */}
          <div className="modal-section">
            <div className="modal-section-label" style={{ color: "#15803d" }}>
              🟢 Vegetarian Items
              <span className="modal-section-hint">— tap a dish for nutrition</span>
            </div>
            {meal.items.map((item, i) => (
              <DishRow key={i} dishName={item} nutritionMap={nutritionMap} isNonVeg={false} />
            ))}
          </div>

          {/* Non-Veg Section */}
          {hasNonVeg && (
            <div className="modal-section">
              <div className="modal-section-label" style={{ color: "#b91c1c", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }}></span> Non-Veg Items
                <span className="modal-nonveg-badge">💳 Extra Payment</span>
              </div>
              <p className="modal-nonveg-warning">
                <AlertTriangle size={14} style={{ flexShrink: 0 }} /> Non-veg dishes are prepared separately and charged additionally.
              </p>
              {visibleNonVeg.map((item, i) => (
                <DishRow key={i} dishName={item} nutritionMap={nutritionMap} isNonVeg={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Today's Meal Tile ─────────────────────────────────────────────
function MealTile({ meal, dietaryPref, nutritionMap }) {
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
        className="meal-tile"
        onClick={() => setOpen(true)}
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
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
        <div className="meal-tile-hint" style={{ marginTop: "auto", color: colors.text, opacity: 0.6, fontSize: "0.75rem" }}>View menu →</div>
      </button>

      {open && (
        <MealModal
          meal={meal}
          dietaryPref={dietaryPref}
          nutritionMap={nutritionMap}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Expandable Meal Card (for non-today days) ────────────────────
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
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "16px 18px", textAlign: "left",
          display: "flex", alignItems: "center", gap: "14px", fontFamily: "inherit"
        }}
      >
        <span style={{
          fontSize: "1.2rem", background: "white", color: "#f59e0b",
          border: "1px solid #fde68a",
          borderRadius: "12px", width: "42px", height: "42px",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          {MEAL_ICONS[meal.mealType]}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>{meal.mealType}</span>
            {rawHasNonVeg && hasNonVeg && (
              <span style={{
                background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                color: "white", fontSize: "0.62rem", fontWeight: 700,
                padding: "2px 8px", borderRadius: "999px"
              }}>
                ⭐ Non-Veg
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {meal.items.slice(0, 3).join(", ")}{meal.items.length > 3 ? ` +${meal.items.length - 3} more` : ""}
          </p>
        </div>

        <span style={{
          fontSize: "1rem", color: "#f59e0b", flexShrink: 0,
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease"
        }}>▾</span>
      </button>

      {expanded && (
        <div style={{ borderTop: "1px solid #f8fafc", padding: "14px 18px 18px", background: "#fafafa", borderRadius: "0 0 16px 16px" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "14px", marginBottom: hasNonVeg ? "12px" : 0 }}>
            <div style={{ fontWeight: 700, color: "#15803d", fontSize: "0.82rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              🟢 Vegetarian Items
              <span style={{ fontWeight: 400, color: "#64748b", fontSize: "0.73rem" }}>— click a dish for nutrition</span>
            </div>
            {meal.items.map((item, i) => (
              <DishRow key={i} dishName={item} nutritionMap={nutritionMap} isNonVeg={false} />
            ))}
          </div>

          {hasNonVeg && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "12px", padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontWeight: 700, color: "#b91c1c", fontSize: "0.82rem" }}>🔴 Non-Veg Items</div>
                <span style={{
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "white", fontSize: "0.65rem", fontWeight: 700,
                  padding: "3px 10px", borderRadius: "999px"
                }}>
                  💳 Extra Payment Required
                </span>
              </div>
              <p style={{ fontSize: "0.72rem", color: "#9f1239", background: "#ffe4e6", borderRadius: "8px", padding: "6px 10px", marginBottom: "10px" }}>
                ⚠️ Non-veg dishes are prepared separately and charged additionally.
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

// ─── Main MenuPage ─────────────────────────────────────────────────
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

  const isViewingToday = selectedDay === todayName;

  return (
    <div className="menu-page">
      <div className="menu-page-inner">
        <Navbar />

        <div className="menu-hero">
          <h1 className="menu-hero-title">🍲 Mess Menu</h1>
          <p className="menu-hero-sub">
            {isViewingToday
              ? "Tap a meal below to see today's dishes"
              : `Viewing ${selectedDay}'s menu — tap a meal to expand`}
          </p>
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

        {/* Content */}
        <div className="menu-content">
          {loading ? (
            <div className="menu-loading">
              <div className="menu-loading-spinner" />
              Loading menu…
            </div>
          ) : selectedMeals.length === 0 ? (
            <div className="menu-empty-state">
              <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🍽️</div>
              <p>No menu uploaded for {selectedDay} yet.</p>
              <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>Ask the admin to update it.</p>
            </div>
          ) : isViewingToday ? (
            /* ── Today: tile grid with blur-modal ── */
            <>
              <div className="today-label">
                <span className="today-dot" />
                Today · {todayName}
              </div>
              <div className="meal-tiles-grid">
                {selectedMeals.map((meal, idx) => (
                  <MealTile
                    key={idx}
                    meal={meal}
                    dietaryPref={dietaryPref}
                    nutritionMap={nutritionMap}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ── Other days: expandable cards ── */
            selectedMeals.map((meal, idx) => (
              <MealCard
                key={idx}
                meal={meal}
                dietaryPref={dietaryPref}
                nutritionMap={nutritionMap}
                isToday={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
