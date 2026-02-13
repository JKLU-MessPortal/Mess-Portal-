import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import axios from "axios";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

const MessScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("Ready to Scan");

  const handleScan = async (detectedCodes) => {
    if (status === "loading" || status === "success" || status === "error") return;

    // The library returns an array of detected codes
    const rawValue = detectedCodes[0]?.rawValue;

    if (rawValue) {
      console.log("Scanned ID:", rawValue);
      setStatus("loading");
      setMessage("Verifying Student...");

      try {
        // Send to Backend
        const res = await axios.post("http://localhost:5000/api/mess/scan", {
          studentId: rawValue,
        });

        if (res.data.success) {
          setStatus("success");
          setMessage(`✅ Allowed: ${res.data.studentName}`);
          
          // Reset after 3 seconds for the next student
          setTimeout(resetScanner, 3000);
        }

      } catch (error) {
        console.error("Scan Error:", error);
        setStatus("error");
        
        // Handle specific backend errors
        if (error.response) {
            setMessage(error.response.data.message || "Scan Failed");
        } else {
            setMessage("Network Error. Check Server.");
        }
      }
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus("idle");
    setMessage("Ready to Scan");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">JKLU Mess Scanner</h1>

      {/* --- CAMERA WINDOW --- */}
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl">
        {status === "idle" && (
          <Scanner 
            onScan={handleScan} 
            components={{ audio: false, torch: true }}
            styles={{ container: { width: "100%", height: "100%" } }}
          />
        )}

        {/* --- OVERLAYS FOR SUCCESS / ERROR --- */}
        {status === "success" && (
          <div className="absolute inset-0 bg-green-500/90 flex flex-col items-center justify-center animate-in fade-in">
            <CheckCircle size={80} className="text-white mb-2" />
            <h2 className="text-2xl font-bold text-white text-center">{message}</h2>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center animate-in fade-in">
            <XCircle size={80} className="text-white mb-2" />
            <h2 className="text-2xl font-bold text-white text-center px-4">{message}</h2>
            <button 
              onClick={resetScanner}
              className="mt-4 bg-white text-red-600 px-6 py-2 rounded-full font-bold shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* --- STATUS TEXT --- */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg w-full max-w-sm text-center">
        <p className={`text-lg font-mono ${status === "loading" ? "animate-pulse text-yellow-400" : "text-gray-300"}`}>
          {message}
        </p>
      </div>
      
      <p className="mt-8 text-gray-500 text-xs">
        Ensure good lighting. Keep QR code steady.
      </p>
    </div>
  );
};

export default MessScanner;