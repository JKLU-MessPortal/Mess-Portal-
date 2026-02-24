import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Form State (For Contractor)
  const [day, setDay] = useState("Monday");
  const [meal, setMeal] = useState("Breakfast");
  const [foodItems, setFoodItems] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  // Analytics & Ledger State (For Accountant & Contractor)
  const [stats, setStats] = useState({ Breakfast: 0, Lunch: 0, Snacks: 0, Dinner: 0 });
  const [totalSaved, setTotalSaved] = useState(0);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      // ALLOW 3 ROLES: admin (super), contractor, or accountant
      const allowedRoles = ["admin", "contractor", "accountant"];
      
      if (!allowedRoles.includes(parsedUser.role)) {
        alert("Access Denied: Authorized Staff Only");
        navigate("/dashboard");
      } else {
        setUser(parsedUser);
        fetchAdminData(); 
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      const resStats = await axios.get("http://localhost:5000/api/admin/headcount");
      if (resStats.data.success) {
        setStats(resStats.data.stats);
        setTotalSaved(resStats.data.totalSaved);
      }

      const resLedger = await axios.get("http://localhost:5000/api/admin/ledger");
      if (resLedger.data.success) {
        setLedger(resLedger.data.ledger);
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    }
  };

  const handleUpdateMenu = async (e) => {
    e.preventDefault();
    setStatusMsg("Updating...");
    try {
      const itemsArray = foodItems.split(",").map(item => item.trim()).filter(item => item !== "");
      const res = await axios.post("http://localhost:5000/api/admin/update-menu", {
        dayOfWeek: day, mealType: meal, items: itemsArray
      });
      if (res.data.success) {
        setStatusMsg(`✅ Success: ${meal} on ${day} has been updated!`);
        setFoodItems(""); 
      }
    } catch (error) {
      setStatusMsg("❌ Failed to update menu.");
    }
  };

  if (!user) return <div style={{textAlign: "center", marginTop: "50px"}}>Loading Admin Portal...</div>;

  // --- ROLE CHECKERS ---
  // Super Admin ('admin') sees everything.
  const canSeeKitchenControls = user.role === "admin" || user.role === "contractor";
  const canSeeFinancials = user.role === "admin" || user.role === "accountant";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", backgroundColor: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.03)", borderLeft: "8px solid #3b82f6" }}>
          <div>
            <h1 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>👨‍💻 Staff Portal</h1>
            <span style={{ fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#64748b" }}>
              Logged in as: {user.role}
            </span>
          </div>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "10px 20px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            Back to Dashboard
          </button>
        </div>

        {/* --- CONTRACTOR SECTION (Kitchen Controls) --- */}
        {canSeeKitchenControls && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "flex-start", marginBottom: "40px" }}>
            
            {/* UPDATE MENU FORM */}
            <div style={{ flex: "1 1 400px", backgroundColor: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: "0 0 20px 0", color: "#333", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Update Mess Menu</h2>
              <form onSubmit={handleUpdateMenu} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#475569" }}>Select Day</label>
                  <select value={day} onChange={(e) => setDay(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}>
                    <option value="Monday">Monday</option><option value="Tuesday">Tuesday</option><option value="Wednesday">Wednesday</option><option value="Thursday">Thursday</option><option value="Friday">Friday</option><option value="Saturday">Saturday</option><option value="Sunday">Sunday</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#475569" }}>Select Meal</label>
                  <select value={meal} onChange={(e) => setMeal(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}>
                    <option value="Breakfast">Breakfast</option><option value="Lunch">Lunch</option><option value="Snacks">Snacks</option><option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#475569" }}>Food Items</label>
                  <textarea value={foodItems} onChange={(e) => setFoodItems(e.target.value)} placeholder="e.g. Paneer, Naan, Rice" required style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px", minHeight: "100px", fontFamily: "inherit" }} />
                </div>
                <button type="submit" style={{ padding: "14px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
                  Update Menu
                </button>
                {statusMsg && <div style={{ padding: "12px", backgroundColor: statusMsg.includes("✅") ? "#dcfce7" : "#fee2e2", color: statusMsg.includes("✅") ? "#166534" : "#991b1b", borderRadius: "8px", textAlign: "center", fontWeight: "bold" }}>{statusMsg}</div>}
              </form>
            </div>

            {/* LIVE ANALYTICS (Cooking Headcount) */}
            <div style={{ flex: "1 1 400px", backgroundColor: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", borderTop: "6px solid #f59e0b" }}>
              <h2 style={{ margin: "0 0 5px 0", color: "#333" }}>📊 Tomorrow's Kitchen Headcount</h2>
              <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Live headcount of meals skipped to avoid food wastage.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                {Object.keys(stats).map((mealType) => (
                  <div key={mealType} style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                    <h3 style={{ margin: "0 0 10px 0", color: "#475569", fontSize: "16px" }}>{mealType}</h3>
                    <span style={{ fontSize: "32px", fontWeight: "bold", color: stats[mealType] > 0 ? "#ef4444" : "#10b981" }}>{stats[mealType]}</span>
                    <span style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginTop: "5px", textTransform: "uppercase", fontWeight: "bold" }}>Cancelled</span>
                  </div>
                ))}
              </div>
              <div style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "15px", borderRadius: "12px", textAlign: "center", fontWeight: "bold", fontSize: "16px" }}>
                Total Meals Saved Tomorrow: {totalSaved}
              </div>
            </div>
          </div>
        )}

        {/* --- ACCOUNTANT SECTION (Financials) --- */}
        {canSeeFinancials && (
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", borderTop: "6px solid #10b981" }}>
            <h2 style={{ margin: "0 0 5px 0", color: "#333" }}>💰 Monthly Refund Ledger</h2>
            <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>
              List of students who cancelled meals this month and are owed a refund.
            </p>

            {ledger.length === 0 ? (
              <p style={{ color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "20px" }}>No meals cancelled this month yet.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {ledger.map((student, idx) => (
                  <div key={idx} style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px" }}>
                    <h3 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "18px" }}>{student.name}</h3>
                    <p style={{ margin: "0 0 15px 0", color: "#64748b", fontSize: "14px" }}>{student.email}</p>
                    
                    <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "8px", borderRadius: "6px", fontWeight: "bold", display: "inline-block", marginBottom: "15px" }}>
                      Total Skips: {student.totalCancelled}
                    </div>

                    <div style={{ fontSize: "13px", color: "#475569" }}>
                      <strong>Details:</strong>
                      <ul style={{ margin: "5px 0 0 0", paddingLeft: "20px" }}>
                        {student.meals.map((m, i) => (
                          <li key={i} style={{ marginBottom: "3px" }}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}