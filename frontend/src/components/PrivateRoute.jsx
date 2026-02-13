import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isAuth = localStorage.getItem("isAuthenticated");
  return isAuth ? children : <Navigate to="/" />;
}