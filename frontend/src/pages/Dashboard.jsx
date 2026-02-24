import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [menuData, setMenuData] = useState({ 
    todayMenu: [], 
    tomorrowMenu: [], 
    fullMenu: [], 
    todayName: "Today", 
    tomorrowName: "Tomorrow",
    skipStats: null,
    tomorrowBookings: []
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchMenu(parsedUser.id || parsedUser._id); 
    } else {
      navigate("/"); 
    }
  }, [navigate]);

  const fetchMenu = async (studentId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/dashboard/data?studentId=${studentId}`);
      if (res.data.success) {
        setMenuData({
          todayMenu: res.data.todayMenu,
          tomorrowMenu: res.data.tomorrowMenu,
          fullMenu: res.data.fullMenu || [], 
          todayName: res.data.todayName,
          tomorrowName: res.data.tomorrowName,
          skipStats: res.data.skipStats,
          tomorrowBookings: res.data.tomorrowBookings
        });
      }
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    }
  };

  const handleToggleMeal = async (mealType, currentStatus) => {
    const newStatus = currentStatus === 'Cancelled' ? 'Booked' : 'Cancelled';
    const studentId = user.id || user._id;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      const res = await axios.post("http://localhost:5000/api/dashboard/toggle", {
        studentId: studentId,
        date: tomorrow,
        mealType: mealType,
        status: newStatus
      });

      if (res.data.success) {
        alert(res.data.message);
        fetchMenu(studentId); 
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert("❌ " + error.response.data.message); 
      } else {
        alert("An error occurred.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return <div style={{textAlign: "center", marginTop: "50px", fontSize: "20px"}}>Loading Portal...</div>;

  const userName = user.name || "Student";
  const userRole = user.role || "student";
  const userEmail = user.email || "No Email";
  const userId = user.id || user._id || "NO_ID_FOUND"; 
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${userId}`;
  const allDaysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f4f7f6", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* --- HEADER --- */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", backgroundColor: "white", padding: "20px 30px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", color: "#1e293b" }}>Welcome back, {userName.split(" ")[0]} 👋</h1>
            <span style={{ fontSize: "13px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>{userRole}</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            
            {/* THE FIX: Button shows for Admin, Contractor, AND Accountant */}
            {(userRole === "admin" || userRole === "contractor" || userRole === "accountant") && (
              <button onClick={() => navigate("/admin")} style={{ backgroundColor: "#3b82f6", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                ⚙️ Staff Portal
              </button>
            )}

            <button onClick={handleLogout} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Logout</button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "30px", alignItems: "flex-start" }}>

          {/* LEFT COLUMN: ID CARD & SKIP STATS */}
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ backgroundColor: "white", padding: "40px 30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center", borderTop: "6px solid #3b82f6" }}>
              <h3 style={{ margin: "0 0 5px 0", color: "#0f172a", fontSize: "20px" }}>JKLU MESS PASS</h3>
              <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 25px 0" }}>Present this QR at the scanner</p>
              <div style={{ border: "3px dashed #e2e8f0", padding: "15px", borderRadius: "15px", display: "inline-block", marginBottom: "25px", backgroundColor: "#f8fafc" }}>
                <img src={qrCodeUrl} alt="QR Code" style={{ display: "block", width: "180px", height: "180px" }} />
              </div>
              <h2 style={{ fontSize: "22px", margin: "0 0 5px 0", color: "#1e293b" }}>{userName}</h2>
              <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 20px 0" }}>{userEmail}</p>
            </div>

            {menuData.skipStats && (
              <div style={{ backgroundColor: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "18px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>
                  📊 Monthly Skips Remaining
                </h3>
                {Object.keys(menuData.skipStats).map(meal => (
                  <div key={meal} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "15px" }}>
                    <span style={{ fontWeight: "bold", color: "#475569" }}>{meal}</span>
                    <span style={{ color: menuData.skipStats[meal].remaining === 0 ? "#ef4444" : "#10b981", fontWeight: "bold" }}>
                      {menuData.skipStats[meal].remaining} / {menuData.skipStats[meal].limit}
                    </span>
                  </div>
                ))}
                <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "15px", fontStyle: "italic" }}>
                  *Skipped meals will be credited to your rebate account at month end.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: TODAY & TOMORROW MENUS */}
          <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: "30px" }}>
            
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 20px 0", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px", fontSize: "20px", color: "#0f172a" }}>
                🍽️ Today ({menuData.todayName})
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                {menuData.todayMenu.length > 0 ? menuData.todayMenu.map((meal, index) => (
                  <div key={index} style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#3b82f6", fontSize: "16px" }}>{meal.mealType}</h4>
                    <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>{meal.items.join(", ")}</p>
                  </div>
                )) : <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No menu uploaded for today.</p>}
              </div>
            </div>

            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "2px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>📅 Tomorrow ({menuData.tomorrowName})</h3>
                <span style={{ fontSize: "13px", color: "#f59e0b", fontWeight: "bold", backgroundColor: "#fef3c7", padding: "5px 10px", borderRadius: "20px" }}>Manage Meals</span>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                {menuData.tomorrowMenu.length > 0 ? menuData.tomorrowMenu.map((meal, index) => {
                  const isCancelled = menuData.tomorrowBookings.some(b => b.mealType === meal.mealType && b.status === "Cancelled");

                  return (
                    <div key={index} style={{ padding: "15px", backgroundColor: isCancelled ? "#fee2e2" : "#f8fafc", borderRadius: "12px", border: "1px solid", borderColor: isCancelled ? "#f87171" : "#e2e8f0", transition: "all 0.3s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <h4 style={{ margin: 0, color: isCancelled ? "#b91c1c" : "#3b82f6", fontSize: "16px", textDecoration: isCancelled ? "line-through" : "none" }}>
                          {meal.mealType}
                        </h4>
                        
                        <button 
                          onClick={() => handleToggleMeal(meal.mealType, isCancelled ? 'Cancelled' : 'Booked')}
                          style={{
                            backgroundColor: isCancelled ? "#10b981" : "#ef4444",
                            color: "white", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "bold"
                          }}
                        >
                          {isCancelled ? "Add Back" : "Skip Meal"}
                        </button>

                      </div>
                      <p style={{ margin: 0, fontSize: "14px", color: "#475569", opacity: isCancelled ? 0.5 : 1 }}>{meal.items.join(", ")}</p>
                      
                      {isCancelled && <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#b91c1c", fontWeight: "bold" }}>🚫 Cancelled for Rebate</p>}
                    </div>
                  );
                }) : <p style={{ color: "#94a3b8", fontStyle: "italic" }}>No menu uploaded for tomorrow.</p>}
              </div>
            </div>

          </div>
        </div>
        
        {/* --- FULL WEEKLY MENU SECTION (Restored!) --- */}
        <div style={{ marginTop: "40px", width: "100%", backgroundColor: "white", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "22px", color: "#1e293b", marginBottom: "20px", borderBottom: "2px solid #e2e8f0", paddingBottom: "15px" }}>
            🗓️ Full Weekly Meal Plan
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {allDaysOfWeek.map(day => {
              const dayMeals = menuData.fullMenu.filter(m => m.dayOfWeek === day);
              if (dayMeals.length === 0) return null; 

              return (
                <div key={day} style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "15px", border: "1px solid #e2e8f0" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "18px", borderBottom: "2px solid #cbd5e1", paddingBottom: "5px" }}>
                    {day}
                  </h4>
                  {dayMeals.map((meal, idx) => (
                    <div key={idx} style={{ marginBottom: "12px" }}>
                      <span style={{ fontWeight: "bold", color: "#3b82f6", fontSize: "14px", display: "block" }}>{meal.mealType}</span>
                      <span style={{ fontSize: "14px", color: "#475569" }}>{meal.items.join(", ")}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          
          {menuData.fullMenu.length === 0 && (
            <p style={{ color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>
              The weekly menu has not been uploaded yet. Please ask an admin to update it.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}