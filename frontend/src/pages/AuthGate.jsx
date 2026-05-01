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

        alert(`Welcome, ${res.data.user.name}!`);
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
      }}
    >
      <Container maxWidth="xs">
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
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "blur(4px)",
              opacity: 0.35,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h4" className="authgate-title">
              Login
            </Typography>

            <Typography variant="h6" className="authgate-subtitle">
              JKLU Mess Portal
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="authgate-btn"
              sx={{
                "&:hover": {
                  backgroundColor: "black",
                  color: "orange",
                  transform: "translateX(5px)",
                  boxShadow: "0 5px 15px orange",
                  border: "2px solid orange",
                },
              }}
            >
              {isLoggingIn ? "Redirecting..." : "Sign in with Outlook"}
            </Button>

            <Typography variant="caption" className="authgate-caption">
              Secure Authentication via Microsoft Azure
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}