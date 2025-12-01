// pages/screens/MyBookings.js

import React, { useState, useEffect } from "react";
import API from "../../api/api";
import "../css/mybookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my");
      setBookings(res.data);
    } catch (err) {
      setMsg("Error loading bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const res = await API.delete(`/bookings/${id}`);
      setMsg(res.data.msg);
      fetchBookings(); // Refresh list
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error canceling booking");
    }
  };

  const isPastBooking = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  return (
    <div className="my-bookings-page">
      <h1 className="title">My Bookings</h1>

      {msg && <p className={`message ${msg.includes('success') ? 'success' : 'error'}`}>{msg}</p>}

      {bookings.length === 0 ? (
        <p className="no-bookings">You have no bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className={`booking-card ${isPastBooking(booking.date) ? 'past' : ''}`}>
              <div className="booking-info">
                <h3>{booking.slot}</h3>
                <p className="booking-date">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {isPastBooking(booking.date) && (
                  <span className="past-badge">Past</span>
                )}
              </div>
              {!isPastBooking(booking.date) && (
                <button
                  className="cancel-btn"
                  onClick={() => handleCancel(booking._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}