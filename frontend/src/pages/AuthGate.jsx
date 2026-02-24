import React from "react";
import { Button, Container, Typography, Paper, Box } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Imports Axios to talk to Backend

export default function AuthGate() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 1. OPEN MICROSOFT POPUP
      const response = await instance.loginPopup(loginRequest);
      const account = response.account;
      const email = account.username.toLowerCase(); // Microsoft calls email 'username'

      // 2. CHECK DOMAIN (Frontend Security)
      if (!email.endsWith("@jklu.edu.in")) {
        alert("Access Denied: Only @jklu.edu.in emails are allowed.");
        await instance.logoutPopup();
        return;
      }

      console.log("Microsoft Login Success. Sending to Backend...");

      // 3. SEND TO BACKEND (The Bridge)
      // This connects the Frontend (Port 3000) to the Backend (Port 5000)
      const res = await axios.post("http://localhost:5000/api/auth/microsoft-login", {
        name: account.name,
        email: email,
        rollNumber: email.split("@")[0], // Extract roll number from email
      });

      // 4. SAVE & REDIRECT
      if (res.status === 200) {
        console.log("Database Saved:", res.data);
        
        // Save the user data we got from the DATABASE (includes ID and Role)
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("isAuthenticated", "true");

        alert(`Welcome, ${res.data.user.name}!`);
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Login Error:", error);
      if (error.response) {
        // This prints the exact error from the backend (e.g., 404 or 500)
        alert(`Server Error: ${error.response.status} - ${error.response.data.message || "Unknown Error"}`);
      } else {
        alert("Network Error: Ensure your Backend (node index.js) is running on Port 5000.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgb(255, 0, 0)", // Red background
        backgroundImage: `url('https://mma.prnewswire.com/media/654758/JK_Lakshmipat_University_Logo.jpg')`,
        backgroundSize: "cover",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={10}
          sx={{
            padding: "40px 20px",
            textAlign: "center",
            backgroundColor: "rgb(255, 255, 127)", // Yellow background
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, color: "#000" }}>
            Login Page
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 4, color: "#333", fontSize: "16px", fontWeight: "bold" }}>
            JKLU Mess Portal
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ textAlign: "center", color: "#666", mb: 3 }}>
              Please use your @jklu.edu.in ID
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              backgroundColor: "#2f2f2f",
              color: "white",
              padding: "12px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#000",
              },
            }}
          >
            Sign in with Outlook
          </Button>
          
          <Typography variant="caption" sx={{ mt: 3, display: "block", color: "#555" }}>
            Secure Authentication via Microsoft Azure
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}