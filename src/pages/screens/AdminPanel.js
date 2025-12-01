// pages/screens/AdminPanel.js

import React, { useState, useEffect } from "react";
import API from "../../api/api";
import "../css/admin.css";

export default function AdminPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSlot, setFilterSlot] = useState("");

  const slots = [
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
  ];

  useEffect(() => {
    fetchAllBookings();
  }, [filterDate, filterSlot]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      let url = "/bookings/admin/all?";
      if (filterDate) url += `date=${filterDate}&`;
      if (filterSlot) url += `slot=${filterSlot}&`;
      
      const res = await API.get(url);
      setBookings(res.data);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      const res = await API.delete(`/bookings/admin/${id}`);
      setMsg(res.data.msg);
      fetchAllBookings();
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error deleting booking");
    }
  };

  const clearFilters = () => {
    setFilterDate("");
    setFilterSlot("");
  };

  if (loading) {
    return <div className="loading">Loading all bookings...</div>;
  }

  return (
    <div className="admin-panel">
      <h1 className="title">Admin Panel - All Bookings</h1>

      {msg && <p className={`message ${msg.includes('success') ? 'success' : 'error'}`}>{msg}</p>}

      <div className="filters">
        <div className="filter-group">
          <label>Filter by Date:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Filter by Slot:</label>
          <select value={filterSlot} onChange={(e) => setFilterSlot(e.target.value)}>
            <option value="">All Slots</option>
            {slots.map((slot, i) => (
              <option key={i} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <button className="clear-btn" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className="stats">
        <p>Total Bookings: <strong>{bookings.length}</strong></p>
      </div>

      {bookings.length === 0 ? (
        <p className="no-bookings">No bookings found.</p>
      ) : (
        <div className="admin-bookings-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Date</th>
                <th>Slot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.user?.name || 'N/A'}</td>
                  <td>{booking.user?.email || 'N/A'}</td>
                  <td>
                    {new Date(booking.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>{booking.slot}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(booking._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}