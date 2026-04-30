import React, { useState, useEffect } from "react";
import axios from "axios";

const EGG_KEYWORDS = ["egg", "omelette", "omlette", "boiled egg", "anda", "bhurji"];
const isEggItem = (name) => EGG_KEYWORDS.some(kw => name.toLowerCase().includes(kw));
const getPrice = (name) => isEggItem(name) ? 30 : 120;
const getItemType = (name) => isEggItem(name) ? "🥚 Egg" : "🍗 Chicken";

// Load Razorpay script dynamically
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function NonVegBookingModal({ item, mealType, tomorrowDate, user, onClose, onSuccess }) {
  const [step, setStep] = useState("details"); // "details" | "paying" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [alreadyBooked, setAlreadyBooked] = useState(false);

  const price = getPrice(item);
  const itemType = getItemType(item);
  const isEgg = isEggItem(item);

  // Check if already booked on mount
  useEffect(() => {
    const checkBooking = async () => {
      try {
        const res = await axios.get(
          `https://mess-portal-server.onrender.com/api/payment/status?studentId=${user.id}&date=${tomorrowDate}`
        );
        if (res.data.success) {
          const found = res.data.bookings.find(
            b => b.mealType === mealType && b.item === item
          );
          if (found) setAlreadyBooked(true);
        }
      } catch (_) {}
    };
    checkBooking();
  }, []);

  const handlePay = async () => {
    setStep("paying");
    setErrorMsg("");

    const razorpayLoaded = await loadRazorpay();
    if (!razorpayLoaded) {
      setErrorMsg("Failed to load Razorpay. Check your internet connection.");
      setStep("error");
      return;
    }

    try {
      const { data } = await axios.post("https://mess-portal-server.onrender.com/api/payment/create-order", {
        studentId: user.id, studentName: user.name, studentEmail: user.email,
        date: tomorrowDate, mealType, item
      });

      if (!data.success) { setErrorMsg(data.message || "Failed to create order."); setStep("error"); return; }

      const options = {
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: "JKLU Mess Portal", description: `${mealType} - ${item}`,
        order_id: data.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#f59e0b" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post("https://mess-portal-server.onrender.com/api/payment/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: data.bookingId
            });
            if (verifyRes.data.success) { setStep("success"); onSuccess && onSuccess(item, mealType); }
            else { setErrorMsg("Payment verification failed."); setStep("error"); }
          } catch (_) { setErrorMsg("Verification error. Contact support."); setStep("error"); }
        },
        modal: { ondismiss: () => setStep("details") }
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Something went wrong.");
      setStep("error");
    }
  };

  // ── Mock / Simulate payment (no real gateway needed) ──
  const handleMockPay = async () => {
    setStep("paying");
    try {
      const res = await axios.post("https://mess-portal-server.onrender.com/api/payment/mock-success", {
        studentId: user.id, studentName: user.name, studentEmail: user.email,
        date: tomorrowDate, mealType, item
      });
      if (res.data.success) { setStep("success"); onSuccess && onSuccess(item, mealType); }
      else { setErrorMsg(res.data.message); setStep("error"); }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || "Simulation failed.");
      setStep("error");
    }
  };

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          background: "rgba(15, 23, 42, 0.55)",
          animation: "fadeIn 0.2s ease"
        }}
      />

      {/* Modal Card */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px"
      }}>
        <div style={{
          background: "white", borderRadius: "20px", width: "100%", maxWidth: "420px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          animation: "slideUp 0.3s ease",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            background: isEgg
              ? "linear-gradient(135deg, #fef3c7, #fde68a)"
              : "linear-gradient(135deg, #fee2e2, #fca5a5)",
            padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "2rem" }}>{isEgg ? "🥚" : "🍗"}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: isEgg ? "#92400e" : "#991b1b" }}>
                  Non-Veg Booking
                </div>
                <div style={{ fontSize: "0.78rem", color: isEgg ? "#b45309" : "#b91c1c", fontWeight: 500 }}>
                  {mealType} · {itemType}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: "#6b7280" }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "24px" }}>
            {/* DETAILS STEP */}
            {(step === "details" || step === "paying") && (
              <>
                {/* Dish Info */}
                <div style={{
                  background: "#f8fafc", borderRadius: "12px", padding: "16px",
                  border: "1px solid #e2e8f0", marginBottom: "20px"
                }}>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: "6px" }}>
                    Dish
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b" }}>{item}</div>
                  <div style={{ marginTop: "8px", fontSize: "0.82rem", color: "#64748b" }}>
                    📅 Available: <strong>Tomorrow ({mealType})</strong>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "0.82rem", color: "#64748b" }}>
                    💳 Payment: <strong>Required at booking</strong> (Non-refundable)
                  </div>
                </div>

                {/* Pricing */}
                <div style={{
                  background: isEgg ? "linear-gradient(135deg,#fefce8,#fef3c7)" : "linear-gradient(135deg,#fef2f2,#fee2e2)",
                  borderRadius: "12px", padding: "16px", marginBottom: "20px",
                  border: `1px solid ${isEgg ? "#fde68a" : "#fca5a5"}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Total Amount</div>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: isEgg ? "#92400e" : "#991b1b" }}>₹{price}</div>
                    <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                      {isEgg ? "Egg item rate (per serving)" : "Chicken item rate (per serving)"}
                    </div>
                  </div>
                  <span style={{ fontSize: "2.5rem" }}>🧾</span>
                </div>

                {/* Already booked notice */}
                {alreadyBooked && (
                  <div style={{
                    background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: "10px",
                    padding: "10px 14px", marginBottom: "16px", fontSize: "0.82rem", color: "#065f46", fontWeight: 600
                  }}>
                    ✅ You have already booked this item for tomorrow!
                  </div>
                )}

                {/* Note */}
                <div style={{
                  background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px",
                  padding: "10px 14px", marginBottom: "20px", fontSize: "0.78rem", color: "#92400e"
                }}>
                  ℹ️ Collect your non-veg meal at the special counter with your student ID. Payment confirmation will be saved in your account.
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                  <button
                    onClick={onClose}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "10px",
                      border: "1px solid #e2e8f0", background: "white", color: "#64748b",
                      fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={alreadyBooked ? undefined : handlePay}
                    disabled={alreadyBooked || step === "paying"}
                    style={{
                      flex: 2, padding: "12px", borderRadius: "10px", border: "none",
                      background: alreadyBooked ? "#10b981" : step === "paying" ? "#94a3b8" : "linear-gradient(135deg, #f59e0b, #d97706)",
                      color: "white", fontWeight: 700, fontSize: "0.95rem",
                      cursor: alreadyBooked || step === "paying" ? "default" : "pointer",
                      fontFamily: "inherit",
                      boxShadow: alreadyBooked || step === "paying" ? "none" : "0 4px 14px rgba(245,158,11,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                    }}
                  >
                    {alreadyBooked ? "✅ Already Booked" : step === "paying" ? "⏳ Opening..." : `💳 Pay ₹${price}`}
                  </button>
                </div>

                {/* Test Mode Button */}
                {!alreadyBooked && (
                  <button
                    onClick={step === "paying" ? undefined : handleMockPay}
                    disabled={step === "paying"}
                    style={{
                      width: "100%", padding: "10px", borderRadius: "10px",
                      border: "2px dashed #6366f1", background: "#eef2ff",
                      color: "#4338ca", fontWeight: 700, fontSize: "0.82rem",
                      cursor: step === "paying" ? "default" : "pointer",
                      fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                    }}
                  >
                    🧪 Simulate Payment (Test Mode)
                  </button>
                )}
              </>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ margin: "0 0 8px", color: "#059669", fontWeight: 800 }}>Booking Confirmed!</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
                  <strong>{item}</strong> for <strong>{mealType}</strong> has been booked successfully.
                  Collect at the non-veg counter tomorrow with your student ID.
                </p>
                <div style={{
                  background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: "12px",
                  padding: "14px", marginBottom: "20px", fontSize: "0.82rem", color: "#065f46"
                }}>
                  💡 Show this confirmation or your student ID at the mess counter.
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                    background: "linear-gradient(135deg,#10b981,#059669)",
                    color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer",
                    fontFamily: "inherit", boxShadow: "0 4px 14px rgba(16,185,129,0.35)"
                  }}
                >
                  Done ✓
                </button>
              </div>
            )}

            {/* ERROR STEP */}
            {step === "error" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
                <h3 style={{ margin: "0 0 8px", color: "#ef4444", fontWeight: 800 }}>Payment Failed</h3>
                <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "20px" }}>{errorMsg}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close</button>
                  <button onClick={() => setStep("details")} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#f59e0b", color: "white", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Try Again</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </>
  );
}
