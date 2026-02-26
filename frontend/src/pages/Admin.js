

import { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";

function Admin() {
  const [name, setName] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [events, setEvents] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [eventReport, setEventReport] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchReports();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReports = async () => {
    try {
      const total = await API.get("/reports/total-bookings");
      const report = await API.get("/reports/event-wise");

      setTotalBookings(total.data.total_bookings);
      setEventReport(report.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createEvent = async () => {
    if (!name || !totalSeats) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await API.post("/events", {
        name,
        total_seats: parseInt(totalSeats),
      });

      toast.success("Event created successfully");
      setName("");
      setTotalSeats("");
      fetchEvents();
      fetchReports();
    } catch (err) {
      toast.error("Only admin can create events");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      toast.success("Event deleted successfully");
      fetchEvents();
      fetchReports();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Cannot delete event"
      );
    }
  };

  // 🔥 NEW: Download Report Function
  const downloadReport = async (type) => {
    try {
      const response = await API.get(`/admin/report/${type}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Dashboard</h2>

      {/* Stats Section */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>Total Bookings</h3>
          <p style={styles.statNumber}>{totalBookings}</p>
        </div>

        <div style={styles.statCard}>
          <h3>Total Events</h3>
          <p style={styles.statNumber}>{events.length}</p>
        </div>
      </div>

      {/* 🔥 NEW: Report Download Section */}
      <div style={styles.card}>
        <h3>Download Reports</h3>

        <div style={styles.formRow}>
          <button
            style={styles.button}
            onClick={() => downloadReport("weekly")}
          >
            Download Weekly Report
          </button>

          <button
            style={styles.button}
            onClick={() => downloadReport("monthly")}
          >
            Download Monthly Report
          </button>
        </div>
      </div>

      {/* Create Event */}
      <div style={styles.card}>
        <h3>Create Event</h3>

        <div style={styles.formRow}>
          <input
            style={styles.input}
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Total Seats"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
          />

          <button style={styles.button} onClick={createEvent}>
            Create
          </button>
        </div>
      </div>

      {/* Event Report */}
      <div style={styles.card}>
        <h3>Event Wise Report</h3>

        {eventReport.length === 0 ? (
          <p>No data available</p>
        ) : (
          eventReport.map((item, index) => (
            <div key={index} style={styles.reportItem}>
              <strong>{item.event_name}</strong>
              <span>{item.total_bookings} bookings</span>
            </div>
          ))
        )}
      </div>

      {/* All Events Table */}
      <div style={styles.card}>
        <h3>All Events</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Total Seats</th>
              <th style={styles.th}>Available Seats</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td style={styles.td}>{event.id}</td>
                <td style={styles.td}>{event.name}</td>
                <td style={styles.td}>{event.total_seats}</td>
                <td style={styles.td}>{event.available_seats}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },
  heading: {
    marginBottom: "30px",
    color: "#198754",
  },
  statsContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    flex: 1,
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    borderTop: "5px solid #198754",
  },
  statNumber: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#dc3545",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  formRow: {
    display: "flex",
    gap: "15px",
    marginTop: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: 1,
  },
  button: {
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#198754",
    color: "white",
    cursor: "pointer",
  },
  deleteButton: {
    padding: "6px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#dc3545",
    color: "white",
    cursor: "pointer",
  },
  reportItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #eee",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  th: {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "center",
    backgroundColor: "#e9ecef",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
};

export default Admin;