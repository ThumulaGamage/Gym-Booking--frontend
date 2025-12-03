// pages/screens/GymSettings.js

import React, { useState, useEffect } from 'react';
import API from '../../../api/api';
import '../../css/GymSettings.css';

export default function GymSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showCloseDateModal, setShowCloseDateModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    name: '',
    startTime: '',
    endTime: '',
    capacity: 10,
    enabled: true
  });
  const [closedDate, setClosedDate] = useState({
    date: '',
    reason: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      setMsg('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookingSystem = async () => {
    try {
      const res = await API.post('/admin/settings/toggle-booking');
      setMsg(res.data.msg);
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error toggling booking system');
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      const updatedSlots = [...settings.slots, newSlot];
      const res = await API.put('/admin/settings', {
        ...settings,
        slots: updatedSlots
      });
      setMsg('Slot added successfully');
      setShowAddSlotModal(false);
      setNewSlot({ name: '', startTime: '', endTime: '', capacity: 10, enabled: true });
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error adding slot');
    }
  };

  const handleUpdateSlot = async (index, updatedSlot) => {
    try {
      const updatedSlots = [...settings.slots];
      updatedSlots[index] = updatedSlot;
      await API.put('/admin/settings', {
        ...settings,
        slots: updatedSlots
      });
      setMsg('Slot updated successfully');
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error updating slot');
    }
  };

  const handleDeleteSlot = async (index) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }
    try {
      const updatedSlots = settings.slots.filter((_, i) => i !== index);
      await API.put('/admin/settings', {
        ...settings,
        slots: updatedSlots
      });
      setMsg('Slot deleted successfully');
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error deleting slot');
    }
  };

  const handleAddClosedDate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/settings/closed-dates', closedDate);
      setMsg('Date marked as closed');
      setShowCloseDateModal(false);
      setClosedDate({ date: '', reason: '' });
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error adding closed date');
    }
  };

  const handleRemoveClosedDate = async (date) => {
    try {
      await API.delete(`/admin/settings/closed-dates/${date}`);
      setMsg('Closed date removed');
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error removing closed date');
    }
  };

  const updateAdvanceBookingDays = async (days) => {
    try {
      await API.put('/admin/settings', {
        ...settings,
        maxAdvanceBookingDays: days
      });
      setMsg('Advance booking days updated');
      fetchSettings();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error updating settings');
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="gym-settings-page">
      <h1>Gym Settings</h1>

      {msg && (
        <div className={`message ${msg.includes('success') ? 'success' : 'error'}`}>
          {msg}
        </div>
      )}

      {/* Booking System Control */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Booking System Control</h2>
          <button
            className={`toggle-btn ${settings.bookingEnabled ? 'enabled' : 'disabled'}`}
            onClick={toggleBookingSystem}
          >
            {settings.bookingEnabled ? '✓ Booking Open' : '✗ Booking Closed'}
          </button>
        </div>
        <p className="section-description">
          {settings.bookingEnabled
            ? 'Users can currently book gym slots'
            : 'Booking system is closed. Users cannot make new bookings.'}
        </p>
      </div>

      {/* Time Slots Management */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Time Slots</h2>
          <button className="add-btn" onClick={() => setShowAddSlotModal(true)}>
            + Add Slot
          </button>
        </div>

        <div className="slots-grid">
          {settings.slots.map((slot, index) => (
            <div key={index} className={`slot-card ${!slot.enabled ? 'disabled' : ''}`}>
              <div className="slot-header">
                <h3>{slot.name}</h3>
                <button
                  className="toggle-slot-btn"
                  onClick={() => handleUpdateSlot(index, { ...slot, enabled: !slot.enabled })}
                >
                  {slot.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <div className="slot-details">
                <p>🕐 Time: {slot.startTime} - {slot.endTime}</p>
                <p>👥 Capacity: {slot.capacity} users</p>
                <p>Status: <span className={slot.enabled ? 'status-active' : 'status-inactive'}>
                  {slot.enabled ? 'Active' : 'Inactive'}
                </span></p>
              </div>
              <div className="slot-actions">
                <input
                  type="number"
                  value={slot.capacity}
                  onChange={(e) => handleUpdateSlot(index, { ...slot, capacity: parseInt(e.target.value) })}
                  min="1"
                  max="50"
                  className="capacity-input"
                />
                <button
                  className="delete-slot-btn"
                  onClick={() => handleDeleteSlot(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advance Booking Settings */}
      <div className="settings-section">
        <h2>Advance Booking Limit</h2>
        <p className="section-description">
          Users can book up to {settings.maxAdvanceBookingDays} days in advance
        </p>
        <div className="advance-booking-control">
          <input
            type="number"
            value={settings.maxAdvanceBookingDays}
            onChange={(e) => updateAdvanceBookingDays(parseInt(e.target.value))}
            min="1"
            max="30"
            className="days-input"
          />
          <span>days</span>
        </div>
      </div>

      {/* Closed Dates */}
      <div className="settings-section">
        <div className="section-header">
          <h2>Closed Dates</h2>
          <button className="add-btn" onClick={() => setShowCloseDateModal(true)}>
            + Add Closed Date
          </button>
        </div>

        {settings.closedDates && settings.closedDates.length > 0 ? (
          <div className="closed-dates-list">
            {settings.closedDates.map((closed, index) => (
              <div key={index} className="closed-date-card">
                <div>
                  <h4>{new Date(closed.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</h4>
                  <p>{closed.reason}</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveClosedDate(closed.date)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No closed dates scheduled</p>
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddSlotModal && (
        <div className="modal-overlay" onClick={() => setShowAddSlotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Time Slot</h2>
            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label>Slot Name</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Slot"
                  value={newSlot.name}
                  onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Capacity (max users)</label>
                <input
                  type="number"
                  value={newSlot.capacity}
                  onChange={(e) => setNewSlot({ ...newSlot, capacity: parseInt(e.target.value) })}
                  min="1"
                  max="50"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddSlotModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Date Modal */}
      {showCloseDateModal && (
        <div className="modal-overlay" onClick={() => setShowCloseDateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Mark Date as Closed</h2>
            <form onSubmit={handleAddClosedDate}>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={closedDate.date}
                  onChange={(e) => setClosedDate({ ...closedDate, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  placeholder="e.g., Holiday, Maintenance"
                  value={closedDate.reason}
                  onChange={(e) => setClosedDate({ ...closedDate, reason: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCloseDateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary">
                  Mark as Closed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}