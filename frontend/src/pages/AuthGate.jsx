import React from "react";
import messImage from "../images/mess.jpeg";
import { Button, Container, Typography, Paper, Box } from "@mui/material";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AuthGate.css";

export default function AuthGate() {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 1. OPEN MICROSOFT POPUP
      const response = await instance.loginPopup(loginRequest);
      const { account } = response;
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
            Sign in with Outlook
          </Button>
          <Typography variant="caption" className="authgate-caption">
            Secure Authentication via Microsoft Azure
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}