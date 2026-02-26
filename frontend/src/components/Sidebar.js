import { Link, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between">

      <div>
        <h2 className="text-2xl font-bold mb-8 text-blue-600">
          TicketApp
        </h2>

        <nav className="flex flex-col gap-4">
          <Link
            to="/events"
            className="hover:bg-blue-100 p-2 rounded"
          >
            Events
          </Link>

          <Link
            to="/my-tickets"
            className="hover:bg-blue-100 p-2 rounded"
          >
            My Tickets
          </Link>

          {role === "admin" && (
            <Link
              to="/admin"
              className="hover:bg-blue-100 p-2 rounded"
            >
              Admin Dashboard
            </Link>
          )}
        </nav>
      </div>

      <button
        onClick={logout}
        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
