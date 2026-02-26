import { useEffect, useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch events when page loads
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load events");
      setLoading(false);
    }
  };

const bookTicket = async (eventId) => {
  try {
    const res = await API.post(`/tickets?event_id=${eventId}`);
    toast.success(`Ticket Booked Successfully!`);
    fetchEvents();
  } catch (err) {
    toast.error("Booking failed ❌");
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  }
  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Events</h2>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => navigate("/my-tickets")}>
          My Tickets
        </button>
        <button
          onClick={logout}
          style={{ marginLeft: "10px" }}
        >
          Logout
        </button>
      </div>


      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events available</p>
      ) : (
        events.map((event) => (
          <div
            key={event.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              width: "400px",
            }}
          >
            <h3>{event.name}</h3>
            <p>Total Seats: {event.total_seats}</p>
            <p>
              Available Seats:{" "}
              <strong>{event.available_seats}</strong>
            </p>


            <button
              onClick={() => bookTicket(event.id)}
              disabled={event.available_seats === 0}
              style={{
                backgroundColor:
                  event.available_seats === 0
                    ? "gray"
                    : "green",
                color: "white",
                padding: "8px",
                border: "none",
                cursor:
                  event.available_seats === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {event.available_seats === 0
                ? "Sold Out"
                : "Book Ticket"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}



export default Events;
