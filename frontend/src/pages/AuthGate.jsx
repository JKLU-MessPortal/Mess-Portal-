import React, { useState, useEffect } from "react";
import messImage from "../images/mess.jpeg";
import { Button, Container, Typography, Paper, Box } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthGate.css";

export default function AuthGate() {
  const { instance, accounts, inProgress } = useMsal();
  const navigate = useNavigate();
  
  //  NAYA STATE: Double-click rokne ke liye
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handleBackendAuthentication = async () => {
      // If MSAL has finished processing and we have an account, but haven't saved to backend yet
      if (inProgress === "none" && accounts.length > 0 && !localStorage.getItem("isAuthenticated")) {
        setIsLoggingIn(true);
        const account = accounts[0];
        const email = account.username.toLowerCase();

        if (!email.endsWith("@jklu.edu.in")) {
          alert("Access Denied: Only @jklu.edu.in emails are allowed.");
          await instance.logoutRedirect();
          setIsLoggingIn(false);
          return;
        }

        console.log("Microsoft Login Success. Sending to Backend...");

        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/microsoft-login`, {
            name: account.name,
            email: email,
          });

          if (res.status === 200) {
            console.log("Database Saved:", res.data);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("isAuthenticated", "true");
            alert(`Welcome, ${res.data.user.name}!`);
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Backend Error:", error);
          if (error.response) {
            alert(`Server Error: ${error.response.status} - ${error.response.data.message || "Unknown Error"}`);
          } else {
            alert("Network Error: Could not connect to the backend server. Please wait a moment or check your console.");
          }
          await instance.logoutRedirect();
        } finally {
          setIsLoggingIn(false);
        }
      } else if (localStorage.getItem("isAuthenticated")) {
        // If already authenticated, redirect to dashboard immediately
        navigate("/dashboard");
      }
    };

    handleBackendAuthentication();
  }, [inProgress, accounts, instance, navigate]);

  const handleLogin = async () => {
    // Agar process pehle se chal raha hai, toh wapas return kar do
    if (isLoggingIn) return; 
    
    setIsLoggingIn(true); // Button ko disable mode mein daalo

    try {
      // 1. OPEN MICROSOFT REDIRECT (Better for Mobile Browsers)
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login Error:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <Box
      className="authgate-page"
      sx={{
        backgroundImage: `url(${messImage})`,
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
            backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyOyKn5i71GaoKjTcL3sBWriHa_NRPQio_Mw&s')`,
            "&:hover": {
              transform: "scale(1.10)",
              boxShadow: "0 20px 100px black",
              border: "2px solid black",
            },
          }}
        >
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
        </Paper>
      </Container>
    </Box>
  );
}