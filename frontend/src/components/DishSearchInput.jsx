import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./DishSearchInput.css";

const EMPTY_CUSTOM = {
  name: "", calories: "", carbohydrate: "", protein: "",
  fat: "", free_sugar: "", fibre: "",
  byweight: false, byquantity: true, quantity_unit: "",
};

/**
 * DishSearchInput
 * Props:
 *   label       — e.g. "🟢 Veg Items"
 *   selectedDishes — array of dish-name strings already added
 *   onAdd(dishName) — called when user confirms a dish (updates parent list)
 *   onRemove(dishName) — called when user removes a tag
 */
export default function DishSearchInput({ label, selectedDishes, onAdd, onRemove, nonVeg = false }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customDish, setCustomDish] = useState(EMPTY_CUSTOM);
  const [savingCustom, setSavingCustom] = useState(false);
  const [customErr, setCustomErr] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounced search
  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nutrition/search?q=${encodeURIComponent(q)}${nonVeg ? '&nonVeg=true' : ''}`;
      const res = await axios.get(url);
      if (res.data.success) setResults(res.data.dishes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 280);
    return () => clearTimeout(t);
  }, [query, search]);

  const handleSelect = (dishName) => {
    if (!selectedDishes.includes(dishName)) onAdd(dishName);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleCustomField = (field, val) =>
    setCustomDish(prev => ({ ...prev, [field]: val }));

  const handleSaveCustom = async () => {
    setCustomErr("");
    if (!customDish.name.trim()) { setCustomErr("Dish name is required."); return; }
    if (!customDish.calories)    { setCustomErr("Calories are required."); return; }
    setSavingCustom(true);
    try {
      const payload = {
        name:          customDish.name.trim(),
        calories:      parseFloat(customDish.calories)      || 0,
        carbohydrate:  parseFloat(customDish.carbohydrate)  || 0,
        protein:       parseFloat(customDish.protein)       || 0,
        fat:           parseFloat(customDish.fat)           || 0,
        free_sugar:    parseFloat(customDish.free_sugar)    || 0,
        fibre:         parseFloat(customDish.fibre)         || 0,
        byweight:      customDish.byweight,
        byquantity:    customDish.byquantity,
        quantity_unit: customDish.quantity_unit || "per serving",
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nutrition`, payload);
      if (res.data.success) {
        onAdd(res.data.dish.name);
        setShowCustomForm(false);
        setCustomDish(EMPTY_CUSTOM);
        setQuery("");
        setShowDropdown(false);
      }
    } catch (e) {
      setCustomErr(e.response?.data?.message || "Failed to save. Try again.");
    } finally { setSavingCustom(false); }
  };

  return (
    <div className="dsi-root">
      <label className="dsi-label">{label}</label>

      {/* Selected dish tags */}
      {selectedDishes.length > 0 && (
        <div className="dsi-tags">
          {selectedDishes.map(d => (
            <span key={d} className="dsi-tag">
              {d}
              <button className="dsi-tag-remove" onClick={() => onRemove(d)} title="Remove">✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="dsi-input-row">
        <div className="dsi-input-wrap">
          <span className="dsi-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="dsi-input"
            type="text"
            placeholder={nonVeg ? "Type dish name (chicken / egg / mutton / omelette)…" : "Type dish name to search…"}
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); setShowCustomForm(false); }}
            onFocus={() => setShowDropdown(true)}
          />
          {loading && <span className="dsi-spin" />}
          {query && <button className="dsi-clear" onClick={() => { setQuery(""); setResults([]); }}>✕</button>}
        </div>

        {/* Dropdown */}
        {showDropdown && query.trim() && (
          <div className="dsi-dropdown" ref={dropdownRef}>
            {results.length === 0 && !loading && (
              <div className="dsi-no-results">No matches found</div>
            )}
            {results.map(dish => (
              <button
                key={dish._id}
                className={`dsi-option ${selectedDishes.includes(dish.name) ? "dsi-option--selected" : ""}`}
                onMouseDown={() => handleSelect(dish.name)}
              >
                <span className="dsi-option-name">{dish.name}</span>
                <span className="dsi-option-meta">{dish.calories} kcal · {dish.quantity_unit}</span>
              </button>
            ))}
            {/* Always show "Others" at bottom */}
            <button
              className="dsi-option dsi-option--others"
              onMouseDown={() => {
                setShowDropdown(false);
                setShowCustomForm(true);
                setCustomDish(prev => ({ ...prev, name: query }));
              }}
            >
              <span>➕ Others — Add custom dish</span>
              <span className="dsi-option-meta">Save to database</span>
            </button>
          </div>
        )}
      </div>

      {/* Custom Dish Form */}
      {showCustomForm && (
        <div className="dsi-custom-form">
          <div className="dsi-custom-form-header">
            <span>📝 Add Custom Dish</span>
            <button className="dsi-custom-close" onClick={() => setShowCustomForm(false)}>✕</button>
          </div>

          <div className="dsi-custom-grid">
            <div className="dsi-custom-field dsi-custom-field--full">
              <label>Dish Name <span className="dsi-req">*</span></label>
              <input className="dsi-custom-input" value={customDish.name}
                onChange={e => handleCustomField("name", e.target.value)}
                placeholder="e.g. Masala Dosa" />
            </div>
            <div className="dsi-custom-field">
              <label>Calories (kcal) <span className="dsi-req">*</span></label>
              <input className="dsi-custom-input" type="number" min="0" value={customDish.calories}
                onChange={e => handleCustomField("calories", e.target.value)}
                placeholder="e.g. 200" />
            </div>
            <div className="dsi-custom-field">
              <label>Carbohydrate (g)</label>
              <input className="dsi-custom-input" type="number" min="0" step="0.1" value={customDish.carbohydrate}
                onChange={e => handleCustomField("carbohydrate", e.target.value)} placeholder="0.0" />
            </div>
            <div className="dsi-custom-field">
              <label>Protein (g)</label>
              <input className="dsi-custom-input" type="number" min="0" step="0.1" value={customDish.protein}
                onChange={e => handleCustomField("protein", e.target.value)} placeholder="0.0" />
            </div>
            <div className="dsi-custom-field">
              <label>Fat (g)</label>
              <input className="dsi-custom-input" type="number" min="0" step="0.1" value={customDish.fat}
                onChange={e => handleCustomField("fat", e.target.value)} placeholder="0.0" />
            </div>
            <div className="dsi-custom-field">
              <label>Free Sugar (g)</label>
              <input className="dsi-custom-input" type="number" min="0" step="0.1" value={customDish.free_sugar}
                onChange={e => handleCustomField("free_sugar", e.target.value)} placeholder="0.0" />
            </div>
            <div className="dsi-custom-field">
              <label>Fibre (g)</label>
              <input className="dsi-custom-input" type="number" min="0" step="0.1" value={customDish.fibre}
                onChange={e => handleCustomField("fibre", e.target.value)} placeholder="0.0" />
            </div>
            <div className="dsi-custom-field dsi-custom-field--full">
              <label>Quantity Unit</label>
              <input className="dsi-custom-input" value={customDish.quantity_unit}
                onChange={e => handleCustomField("quantity_unit", e.target.value)}
                placeholder="e.g. 1 piece (~100g)  or  per 100g" />
            </div>
            <div className="dsi-custom-field dsi-custom-field--full">
              <label>Measurement Type</label>
              <div className="dsi-toggle-row">
                <label className={`dsi-toggle ${customDish.byquantity ? "dsi-toggle--active" : ""}`}>
                  <input type="checkbox" checked={customDish.byquantity}
                    onChange={e => handleCustomField("byquantity", e.target.checked)} />
                  By Quantity
                </label>
                <label className={`dsi-toggle ${customDish.byweight ? "dsi-toggle--active" : ""}`}>
                  <input type="checkbox" checked={customDish.byweight}
                    onChange={e => handleCustomField("byweight", e.target.checked)} />
                  By Weight (per 100g)
                </label>
              </div>
            </div>
          </div>

          {customErr && <div className="dsi-custom-err">{customErr}</div>}

          <div className="dsi-custom-actions">
            <button className="dsi-btn-cancel" onClick={() => setShowCustomForm(false)}>Cancel</button>
            <button className="dsi-btn-save" onClick={handleSaveCustom} disabled={savingCustom}>
              {savingCustom ? "Saving…" : "💾 Save & Add to Menu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
