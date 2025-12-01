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

  useEffect(() => {
    fetchGymSettings();
  }, []);

  useEffect(() => {
    if (gymSettings) {
      fetchAvailability();
    }
  }, [selectedDate, gymSettings]);

  const fetchGymSettings = async () => {
    try {
      const res = await API.get('/admin/settings');
      setGymSettings(res.data);
      // Get enabled slots
      const enabledSlots = res.data.slots.filter(s => s.enabled);
      setSlots(enabledSlots);
    } catch (err) {
      console.error("Error fetching gym settings:", err);
      // Fallback to default slots
      setSlots([
        { name: "4:00 PM - 6:00 PM", capacity: 10, enabled: true },
        { name: "6:00 PM - 8:00 PM", capacity: 10, enabled: true }
      ]);
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
    } catch (err) {
      setMsg(err.response?.data?.msg || "Error booking slot");
    } finally {
      setLoading(false);
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
    // Check if slot is disabled in settings
    if (slotAvailability.slotCapacities?.[slot.name]?.enabled === false) {
      return true;
    }
    return false;
  };

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
    </div>
  );
}