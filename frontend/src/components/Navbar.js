import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, [location]); // update when route changes

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  if (!token) return null;

  return (
    <div style={styles.navbar}>
      <div style={styles.left}>
        <NavItem to="/events" label="Events" />
        <NavItem to="/my-tickets" label="My Tickets" />

        {role === "admin" && (
          <NavItem to="/admin" label="Admin" />
        )}
      </div>

      <button onClick={handleLogout} style={styles.logout}>
        Logout
      </button>
    </div>
  );
}

function NavItem({ to, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        ...styles.link,
        ...(isActive ? styles.activeLink : {})
      }}
    >
      {label}
    </Link>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 30px",
    background: "#111",
  },
  left: {
    display: "flex",
    gap: "25px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
  },
  activeLink: {
    borderBottom: "2px solid #4CAF50",
  },
  logout: {
    background: "#e63946",
    color: "white",
    border: "none",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: "5px",
    fontWeight: "600",
  },
};

export default Navbar;
