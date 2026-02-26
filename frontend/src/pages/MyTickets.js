
// export default MyTickets;
import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";

function MyTickets() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const response = await API.get("/my-tickets");
      setTickets(response.data);
    } catch (error) {
      toast.error("Failed to load tickets");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const cancelTicket = async (ticketId) => {
    try {
      await API.delete(`/tickets/${ticketId}`);
      toast.success("Ticket cancelled successfully");
      fetchTickets();
    } catch (error) {
      toast.error("Cancel failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tickets</h2>

      {tickets.length === 0 ? (
        <p>No tickets booked yet.</p>
      ) : (
        tickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px"
            }}
          >
            <h3>{ticket.event_name}</h3>
            <p><strong>Reference:</strong> {ticket.reference_number}</p>

            <button
              onClick={() => cancelTicket(ticket.id)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "8px 12px",
                cursor: "pointer"
              }}
            >
              Cancel Ticket
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default MyTickets;