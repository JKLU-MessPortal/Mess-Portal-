import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import AuthGate from "./pages/AuthGate";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
// ... other imports
import Scanner from "./pages/Scanner"; // Import the file we just made

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        
        {/* Student Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Staff Scanner (New Route) */}
        <Route path="/scan" element={<Scanner />} />

      </Routes>
    </BrowserRouter>
  );
}
export default App;