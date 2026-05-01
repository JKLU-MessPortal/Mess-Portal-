import React, { useState, useEffect } from "react";
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

  // Effect to handle the redirect response after coming back from Microsoft
  useEffect(() => {
    instance.handleRedirectPromise()
      .then((response) => {
        if (response && response.account) {
          processLogin(response.account);
        }
      })
      .catch((error) => {
        console.error("Redirect Login Error:", error);
      });
  }, [instance]);

  const processLogin = async (account) => {
    const email = account.username.toLowerCase();

    // 2. CHECK DOMAIN (Frontend Security)
    if (!email.endsWith("@jklu.edu.in")) {
      alert("Access Denied: Only @jklu.edu.in emails are allowed.");
      instance.logoutRedirect();
      return;
    }

    setIsLoggingIn(true);
    try {
      console.log("Microsoft Login Success. Sending to Backend...");

      // 3. SEND TO BACKEND (The Bridge)
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/microsoft-login`, {
        name: account.name,
        email: email,
      });

      // 4. SAVE & REDIRECT
      if (res.status === 200) {
        console.log("Database Saved:", res.data);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("isAuthenticated", "true");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Backend Auth Error:", error);
      alert("Auth Error: Could not verify with backend. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async () => {
    if (isLoggingIn) return;
    
    try {
      // Switch to Redirect flow for better mobile compatibility
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login Initiation Error:", error);
      alert("Could not start login process. Please check your internet connection.");
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