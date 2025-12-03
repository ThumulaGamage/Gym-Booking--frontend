// pages/screens/booking.js

import React, { useState, useEffect } from "react";
import API from "../../api/api";
import "../css/booking.css";

export default function Booking() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [slotAvailability, setSlotAvailability] = useState({});
  const [gymSettings, setGymSettings] = useState(null);
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    fetchGymSettings();
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (gymSettings) {
      fetchAvailability();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, gymSettings]);

  const fetchGymSettings = async () => {
    try {
      const res = await API.get('/bookings/settings');
      setGymSettings(res.data);
      const enabledSlots = res.data.slots.filter(s => s.enabled);
      setSlots(enabledSlots);
    } catch (err) {
      console.error("Error fetching gym settings:", err);
      setSlots([]);
      setMsg("Unable to load gym settings. Please try again later.");
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await API.get(`/bookings/availability/${selectedDate}`);
      setSlotAvailability(res.data);
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setBookingsLoading(true);
      const res = await API.get('/bookings/my');
      setMyBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      return setMsg("Please select a slot");
    }

    try {
      setLoading(true);
      setMsg("");

      const res = await API.post("/bookings", {
        slot: selectedSlot,
        date: selectedDate
      });

      setMsg(res.data.msg);
      setSelectedSlot(null);
      fetchAvailability();
      fetchMyBookings(); // Refresh my bookings after new booking
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error booking slot");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const res = await API.delete(`/bookings/${id}`);
      setMsg(res.data.msg);
      fetchMyBookings();
      fetchAvailability(); // Refresh availability after cancellation
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error canceling booking");
    }
  };

  const getSlotsRemaining = (slot) => {
    const slotConfig = slots.find(s => s.name === slot.name);
    const capacity = slotConfig ? slotConfig.capacity : 10;
    const booked = slotAvailability.slotCounts?.[slot.name] || 0;
    return capacity - booked;
  };

  const isSlotFull = (slot) => {
    return getSlotsRemaining(slot) <= 0;
  };

  const isSlotDisabled = (slot) => {
    if (slotAvailability.slotCapacities?.[slot.name]?.enabled === false) {
      return true;
    }
    return false;
  };

  const isPastBooking = (date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate < today;
  };

  // Separate upcoming and past bookings
  const upcomingBookings = myBookings.filter(b => !isPastBooking(b.date));
  const pastBookings = myBookings.filter(b => isPastBooking(b.date));

  // Check if booking is closed
  if (gymSettings && !gymSettings.bookingEnabled) {
    return (
      <div className="booking-page">
        <h1 className="title">Book Your Gym Slot</h1>
        <div className="booking-closed-message">
          <h2>🚫 Booking System Closed</h2>
          <p>The gym booking system is currently closed by the administrator.</p>
          <p>Please check back later or contact the gym staff.</p>
        </div>

        {/* Show My Bookings even when booking is closed */}
        <div className="my-bookings-section">
          <h2 className="section-title">My Bookings</h2>
          {bookingsLoading ? (
            <div className="loading-text">Loading your bookings...</div>
          ) : myBookings.length === 0 ? (
            <p className="no-bookings-text">You have no bookings yet.</p>
          ) : (
            <div className="bookings-container">
              {upcomingBookings.length > 0 && (
                <div className="bookings-group">
                  <h3 className="group-title">Upcoming Bookings</h3>
                  <div className="bookings-list">
                    {upcomingBookings.map((booking) => (
                      <div key={booking._id} className="booking-item">
                        <div className="booking-info">
                          <h4>{booking.slot}</h4>
                          <p className="booking-date">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          className="cancel-booking-btn"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pastBookings.length > 0 && (
                <div className="bookings-group">
                  <h3 className="group-title">Past Bookings</h3>
                  <div className="bookings-list">
                    {pastBookings.map((booking) => (
                      <div key={booking._id} className="booking-item past">
                        <div className="booking-info">
                          <h4>{booking.slot}</h4>
                          <p className="booking-date">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className="past-badge">Completed</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if selected date is closed
  if (slotAvailability.isClosed) {
    return (
      <div className="booking-page">
        <h1 className="title">Book Your Gym Slot</h1>
        <div className="date-selector">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            max={gymSettings ? new Date(Date.now() + gymSettings.maxAdvanceBookingDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined}
          />
        </div>
        <div className="date-closed-message">
          <h2>🚫 Gym Closed on This Date</h2>
          <p>Reason: {slotAvailability.closureReason}</p>
          <p>Please select a different date.</p>
        </div>

        {/* Show My Bookings */}
        <div className="my-bookings-section">
          <h2 className="section-title">My Bookings</h2>
          {bookingsLoading ? (
            <div className="loading-text">Loading your bookings...</div>
          ) : myBookings.length === 0 ? (
            <p className="no-bookings-text">You have no bookings yet.</p>
          ) : (
            <div className="bookings-container">
              {upcomingBookings.length > 0 && (
                <div className="bookings-group">
                  <h3 className="group-title">Upcoming Bookings</h3>
                  <div className="bookings-list">
                    {upcomingBookings.map((booking) => (
                      <div key={booking._id} className="booking-item">
                        <div className="booking-info">
                          <h4>{booking.slot}</h4>
                          <p className="booking-date">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <button
                          className="cancel-booking-btn"
                          onClick={() => handleCancelBooking(booking._id)}
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pastBookings.length > 0 && (
                <div className="bookings-group">
                  <h3 className="group-title">Past Bookings</h3>
                  <div className="bookings-list">
                    {pastBookings.map((booking) => (
                      <div key={booking._id} className="booking-item past">
                        <div className="booking-info">
                          <h4>{booking.slot}</h4>
                          <p className="booking-date">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className="past-badge">Completed</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <h1 className="title">Book Your Gym Slot</h1>

      {msg && <p className={`message ${msg.includes('success') ? 'success' : 'error'}`}>{msg}</p>}

      <div className="date-selector">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          max={gymSettings ? new Date(Date.now() + gymSettings.maxAdvanceBookingDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined}
        />
      </div>

      {slots.length === 0 ? (
        <div className="no-slots-message">
          <p>No active slots available. Please check back later.</p>
        </div>
      ) : (
        <div className="slot-grid">
          {slots.map((slot, i) => {
            const remaining = getSlotsRemaining(slot);
            const isFull = isSlotFull(slot);
            const isDisabled = isSlotDisabled(slot);
            
            return (
              <div
                key={i}
                className={`slot-card ${selectedSlot === slot.name ? "selected" : ""} ${isFull || isDisabled ? "full" : ""}`}
                onClick={() => !isFull && !isDisabled && setSelectedSlot(slot.name)}
              >
                <div className="slot-time">{slot.name}</div>
                <div className="slot-availability">
                  {isDisabled ? (
                    <span className="disabled-text">DISABLED</span>
                  ) : isFull ? (
                    <span className="full-text">FULL</span>
                  ) : (
                    <span className="remaining-text">{remaining} spots left</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button className="confirm-btn" onClick={handleBooking} disabled={loading || !selectedSlot}>
        {loading ? "Saving..." : "Confirm Booking"}
      </button>

      {/* My Bookings Section */}
      <div className="my-bookings-section">
        <h2 className="section-title">My Bookings</h2>
        {bookingsLoading ? (
          <div className="loading-text">Loading your bookings...</div>
        ) : myBookings.length === 0 ? (
          <p className="no-bookings-text">You have no bookings yet. Book your first slot above!</p>
        ) : (
          <div className="bookings-container">
            {upcomingBookings.length > 0 && (
              <div className="bookings-group">
                <h3 className="group-title">Upcoming Bookings ({upcomingBookings.length})</h3>
                <div className="bookings-list">
                  {upcomingBookings.map((booking) => (
                    <div key={booking._id} className="booking-item">
                      <div className="booking-info">
                        <h4>{booking.slot}</h4>
                        <p className="booking-date">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        className="cancel-booking-btn"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div className="bookings-group">
                <h3 className="group-title">Past Bookings ({pastBookings.length})</h3>
                <div className="bookings-list">
                  {pastBookings.map((booking) => (
                    <div key={booking._id} className="booking-item past">
                      <div className="booking-info">
                        <h4>{booking.slot}</h4>
                        <p className="booking-date">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="past-badge">Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}