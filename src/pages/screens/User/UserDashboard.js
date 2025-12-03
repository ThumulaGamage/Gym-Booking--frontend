// pages/screens/UserDashboard.js

import React, { useEffect, useState } from 'react';
import API from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboard.css';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchUpcomingBookings();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setMsg('Failed to load profile');
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const res = await API.get('/bookings/my');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const upcoming = res.data.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= today;
      });
      
      setUpcomingBookings(upcoming.slice(0, 3));
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="page-background">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Student Dashboard</h2>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>

        {msg && <div className="error-message">{msg}</div>}

        {!user ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{user.name}</h3>
                  <span className="role-badge">{user.role}</span>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{user.email}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Role</span>
                  <span className="detail-value">{user.role}</span>
                </div>

                {user.registrationNo && (
                  <div className="detail-item">
                    <span className="detail-label">Registration No</span>
                    <span className="detail-value">{user.registrationNo}</span>
                  </div>
                )}

                {user.indexNo && (
                  <div className="detail-item">
                    <span className="detail-label">Index No</span>
                    <span className="detail-value">{user.indexNo}</span>
                  </div>
                )}

                {user.batch && (
                  <div className="detail-item">
                    <span className="detail-label">Batch</span>
                    <span className="detail-value">{user.batch}</span>
                  </div>
                )}

                {user.telNo && (
                  <div className="detail-item">
                    <span className="detail-label">Tel No</span>
                    <span className="detail-value">{user.telNo}</span>
                  </div>
                )}

                <div className="detail-item">
                  <span className="detail-label">Upcoming Bookings</span>
                  <span className="detail-value">{upcomingBookings.length}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Bookings Section */}
            {upcomingBookings.length > 0 && (
              <div className="quick-links-section">
                <h3 className="section-title">Upcoming Sessions</h3>
                <div className="bookings-preview-list">
                  {upcomingBookings.map((booking) => (
                    <div key={booking._id} className="booking-preview-card">
                      <div className="booking-preview-date">
                        <div className="preview-day">
                          {new Date(booking.date).toLocaleDateString('en-US', { day: 'numeric' })}
                        </div>
                        <div className="preview-month">
                          {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      <div className="booking-preview-info">
                        <h4>{booking.slot}</h4>
                        <p>{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="quick-links-section">
              <h3 className="section-title">Quick Links</h3>

              <div className="quick-links-grid">
                {/* Book Gym Slot */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/booking")}
                >
                  <div className="link-icon">🏋️</div>
                  <h4>Book Gym Slot</h4>
                  <p>Reserve your workout time</p>
                </div>

                {/* My QR Code - UPDATED */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/my-qr")}
                >
                  <div className="link-icon">📱</div>
                  <h4>My QR Code</h4>
                  <p>Generate check-in QR code</p>
                </div>

                <div className="link-card">
                  <div className="link-icon">📊</div>
                  <h4>Attendance History</h4>
                  <p>View your gym records</p>
                  <span className="coming-soon">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}