import React, { useState } from "react";
import axios from "axios";

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

export default function DayScholarBookingModal({ mealType, tomorrowDate, user, onClose, onSuccess }) {
  const [step, setStep] = useState("details"); // "details" | "paying" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const price = 50;

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
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/create-meal-order`, {
        studentId: user.id || user._id, 
        date: tomorrowDate, 
        mealType
      });

      if (!data.success) { setErrorMsg(data.message || "Failed to create order."); setStep("error"); return; }

      const options = {
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: "JKLU Mess Portal", description: `Day Scholar - ${mealType}`,
        order_id: data.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#3b82f6" },
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/verify-meal`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: data.bookingId
            });
            if (verifyRes.data.success) { setStep("success"); onSuccess && onSuccess(mealType); }
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/mock-meal-success`, {
        studentId: user.id || user._id, 
        date: tomorrowDate, 
        mealType
      });
      if (res.data.success) { setStep("success"); onSuccess && onSuccess(mealType); }
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
            background: "linear-gradient(135deg, #eff6ff, #bfdbfe)",
            padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "2rem" }}>🍽️</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1e3a8a" }}>
                  Day Scholar Booking
                </div>
                <div style={{ fontSize: "0.78rem", color: "#1d4ed8", fontWeight: 500 }}>
                  {mealType}
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
                    Meal Details
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b" }}>{mealType}</div>
                  <div style={{ marginTop: "8px", fontSize: "0.82rem", color: "#64748b" }}>
                    📅 Available: <strong>Tomorrow</strong>
                  </div>
                  <div style={{ marginTop: "4px", fontSize: "0.82rem", color: "#64748b" }}>
                    💳 Payment: <strong>Required at booking</strong> (Non-refundable)
                  </div>
                </div>

                {/* Pricing */}
                <div style={{
                  background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                  borderRadius: "12px", padding: "16px", marginBottom: "20px",
                  border: `1px solid #86efac`,
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 600, textTransform: "uppercase" }}>Total Amount</div>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#14532d" }}>₹{price}</div>
                    <div style={{ fontSize: "0.72rem", color: "#15803d" }}>
                      Regular meal rate
                    </div>
                  </div>
                  <span style={{ fontSize: "2.5rem" }}>🧾</span>
                </div>

                {/* Note */}
                <div style={{
                  background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px",
                  padding: "10px 14px", marginBottom: "20px", fontSize: "0.78rem", color: "#92400e"
                }}>
                  ℹ️ Once purchased, the meal will be added to your QR Code. Scan at the mess entry to claim your meal.
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
                    onClick={handlePay}
                    disabled={step === "paying"}
                    style={{
                      flex: 2, padding: "12px", borderRadius: "10px", border: "none",
                      background: step === "paying" ? "#94a3b8" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                      color: "white", fontWeight: 700, fontSize: "0.95rem",
                      cursor: step === "paying" ? "default" : "pointer",
                      fontFamily: "inherit",
                      boxShadow: step === "paying" ? "none" : "0 4px 14px rgba(59,130,246,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                    }}
                  >
                    {step === "paying" ? "⏳ Opening..." : `💳 Pay ₹${price}`}
                  </button>
                </div>

                {/* Test Mode Button */}
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
              </>
            )}

            {/* SUCCESS STEP */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ fontSize: "4rem", marginBottom: "12px" }}>🎉</div>
                <h3 style={{ margin: "0 0 8px", color: "#059669", fontWeight: 800 }}>Purchase Confirmed!</h3>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "20px" }}>
                  <strong>{mealType}</strong> has been purchased successfully for tomorrow.
                  Your QR code will be active at the mess counter.
                </p>
                <div style={{
                  background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: "12px",
                  padding: "14px", marginBottom: "20px", fontSize: "0.82rem", color: "#065f46"
                }}>
                  💡 You can now see the "Purchased" status on your dashboard.
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
