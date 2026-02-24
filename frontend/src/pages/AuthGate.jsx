import React from "react";
import messImage from "../images/mess.jpeg";
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
        backgroundImage: `url('data:image/jpeg;base64,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')`,
        backgroundSize: "---",
        backgroundPosition: "center",


      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={10}
          sx={{
            
            padding: "40px 20px",
            height: "400px",
            width: "400px",
            textAlign: "center",
            backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyOyKn5i71GaoKjTcL3sBWriHa_NRPQio_Mw&s')`,
            backgroundSize: "-",
            backgroundColor: "rgb(255, 255, 127)", // Yellow background
            borderRadius: "15px",
            border: "2px solid orange",
            boxShadow: "0 10px 30px orange", // Orange shadow
              "&:hover": {
                color: "black",
                transform: "skew(0deg) scale(1.10)",
                boxShadow: "0 20px 100px black",
                transition: "all 0.3s ease",
                border: "2px solid black",
              },
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, color: "black", }}>
            Login Page
          </Typography>

          <Typography variant="h6" sx={{ mb: 4, color: "black", fontSize: "16px", fontWeight: "bold", }}>
            JKLU Mess Portal
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ textAlign: "center", color: "black", mb: 3 }}>
              Please use your @jklu.edu.in ID
            </Typography>
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
            backgroundColor: "orange",
            color: "black",
            padding: "12px",
            fontWeight: "bold",
            border: "2px solid black",
            // Add transition for smooth hover effect
            "&:hover": {
              backgroundColor: "black",
              color: "orange",
              transform: "skew(10deg) scale(1.10)",
              boxShadow: "0 5px 15px orange",
              transform: "translate(5px)", 
              transition: "all 0.3s ease",
              border: "2px solid orange",
              },
            }}
          >
            Sign in with Outlook
          </Button>
            
          <Typography variant="caption" sx={{ mt: 3, display: "block", color: "black",fontWeight: "bold", }}>
            Secure Authentication via Microsoft Azure
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}