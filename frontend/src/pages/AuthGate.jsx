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
        
        // --- FIX STARTS HERE ---
        // 1. Use the imported variable, not the long text string
        backgroundImage: `url(${messImage})`, 
        // 2. "cover" scales the image to fill the whole screen
        backgroundSize: "cover", 
        // 3. Keeps the image centered
        backgroundPosition: "center",
        // 4. Prevents the "tiling" effect
        backgroundRepeat: "no-repeat",
        // --- FIX ENDS HERE ---
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
            backgroundSize: "contain",
            backgroundPosition: "center calc(100% - -120px)",
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
            Login 
          </Typography>

          <Typography variant="h6" sx={{ mb: 4, color: "black", fontSize: "16px", fontWeight: "bold", }}>
            JKLU Mess Portal
          </Typography>
          
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

          {/* ⚡⚡⚡ PASTE THIS NEW BUTTON HERE ⚡⚡⚡ */}
          <Button
            fullWidth
            onClick={() => {
              // 1. Create a Fake User
              const devUser = {
                _id: "dev_user_123", 
                name: "Developer Mode",
                email: "dev@jklu.edu.in",
                role: "student" // CHANGE THIS TO 'admin' OR 'accountant' TO TEST THOSE ROLES
              };
              // 2. Save to Browser Memory
              localStorage.setItem("user", JSON.stringify(devUser));
              localStorage.setItem("isAuthenticated", "true");
              // 3. Jump to Dashboard
              navigate("/dashboard");
            }}
            sx={{
              marginTop: "15px", // Spacing from the top button
              backgroundColor: "#222",
              color: "#0f0", // Matrix Green
              border: "1px dashed #0f0",
              fontWeight: "bold",
              "&:hover": { backgroundColor: "black", borderColor: "white", color: "white" }
            }}
          >
            ⚡ DEV MODE (Skip Login)
          </Button>
          {/* ⚡⚡⚡ END OF NEW BUTTON ⚡⚡⚡ */}
            
          <Typography variant="caption" sx={{ mt: 3, display: "block", color: "black",fontWeight: "bold", }}>
            Secure Authentication via Microsoft Azure
          </Typography>
            
          <Typography variant="caption" sx={{ mt: 3, display: "block", color: "black",fontWeight: "bold", }}>
            Secure Authentication via Microsoft Azure
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}