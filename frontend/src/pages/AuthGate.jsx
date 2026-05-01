import React, { useState } from "react";
import messImage from "../images/mess.jpeg";
import jkluLogo from "../images/JK_Lakshmipat_University_Logo.jpg";
import { Button, Container, Typography, Paper, Box } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthGate.css";

export default function AuthGate() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  //  NAYA STATE: Double-click rokne ke liye
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    // Agar process pehle se chal raha hai, toh wapas return kar do
    if (isLoggingIn) return;

    setIsLoggingIn(true); // Button ko disable mode mein daalo

    try {
      // 1. OPEN MICROSOFT POPUP
      const response = await instance.loginPopup(loginRequest);
      const { account } = response;
      const email = account.username.toLowerCase();

      // 2. CHECK DOMAIN (Frontend Security)
      if (!email.endsWith("@jklu.edu.in")) {
        alert("Access Denied: Only @jklu.edu.in emails are allowed.");
        await instance.logoutPopup();
        setIsLoggingIn(false);
        return;
      }

      console.log("Microsoft Login Success. Sending to Backend...");

      // 3. SEND TO BACKEND (The Bridge)
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/microsoft-login`, {
        name: account.name,
        email: email,
        // UPDATE: rollNumber yahan se hata diya kyunki DB se delete kar diya tha
      });

      // 4. SAVE & REDIRECT
      if (res.status === 200) {
        console.log("Database Saved:", res.data);

        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("isAuthenticated", "true");

        // alert(`Welcome, ${res.data.user.name}!`);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        alert(`Server Error: ${error.response.status} - ${error.response.data.message || "Unknown Error"}`);
      } else {
        // MSAL popup close karne par jo error aata hai usko silent rakha hai
        if (error.name !== "BrowserAuthError") {
          alert("Network Error: Could not connect to the backend server. Please wait a moment for it to wake up or check your console for details.");
        }
      }
    } finally {
      // Success ho ya Error, aakhir mein button ko wapas enable kar do
      setIsLoggingIn(false);
    }
  };

  return (
    <Box
      className="authgate-page"
      sx={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${messImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={10}
        className="authgate-card"
        sx={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f9f9f9 !important",
          "&:hover": {
            transform: "scale(1.05)",
            boxShadow: "0 20px 100px rgba(0,0,0,0.5)",
            border: "2px solid orange",
          },
        }}
      >
        {/* Blurred Background Logo */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${jkluLogo})`,
            backgroundSize: "80%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(6px)",
            opacity: 0.25,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <Box sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <Typography variant="h4" className="authgate-title" sx={{ fontSize: { xs: "1.8rem", sm: "2.125rem" } }}>
            Login
          </Typography>

          <Typography variant="h6" className="authgate-subtitle" sx={{ mb: 4 }}>
            JKLU Mess Portal
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="authgate-btn"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "1.1rem",
              py: 1.5,
              mb: 2,
              "&:hover": {
                backgroundColor: "black",
                color: "orange",
                transform: "translateY(-2px)",
                boxShadow: "0 10px 20px rgba(255, 165, 0, 0.4)",
                border: "2px solid orange",
              },
            }}
          >
            {isLoggingIn ? "Redirecting..." : "Sign in with Outlook"}
          </Button>

          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mt: 2,
            opacity: 0.9
          }}>
            {/* <img 
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" 
                alt="Azure" 
                style={{ width: "16px", height: "16px" }} 
              /> */}
            <Typography variant="caption" className="authgate-caption" sx={{ mt: "0 !important" }}>
              Secure Authentication via Microsoft Azure
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}