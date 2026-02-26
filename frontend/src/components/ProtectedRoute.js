import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, adminOnly }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token → go to login
  if (!token) {
    return <Navigate to="/" />;
  }

  // If admin route but user is not admin
  if (adminOnly && role !== "admin") {
    return <Navigate to="/events" />;
  }

  return children;
}

export default ProtectedRoute;
