// pages/screens/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import API from '../../../api/api';
import { useNavigate } from 'react-router-dom';
import '../../css/Dashboard.css';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalUsers: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchAdminData();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setMsg('Failed to load profile');
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await API.get('/bookings/admin/all');
      const allBookings = res.data;

      const today = new Date().toISOString().split('T')[0];
      const todayBookings = allBookings.filter(b => b.date === today);

      setStats({
        totalBookings: allBookings.length,
        todayBookings: todayBookings.length,
        totalUsers: new Set(allBookings.map(b => b.user?._id)).size
      });

      setRecentBookings(allBookings.slice(0, 3));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="page-background">
      <div className="dashboard-container admin-dashboard">
        <div className="dashboard-header admin-header">
          <h2 className="dashboard-title">Admin Dashboard</h2>
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
            {/* Profile Card */}
            <div className="profile-card admin-profile">
              <div className="profile-header">
                <div className="profile-avatar admin-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h3>{user.name}</h3>
                  <span className="role-badge admin-badge">{user.role}</span>
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
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="quick-links-section">
              <h3 className="section-title">System Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card blue">
                  <div className="stat-icon">📊</div>
                  <div className="stat-info">
                    <h3>{stats.totalBookings}</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>

                <div className="stat-card green">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <h3>{stats.todayBookings}</h3>
                    <p>Today's Bookings</p>
                  </div>
                </div>

                <div className="stat-card purple">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Active Members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            {recentBookings.length > 0 && (
              <div className="quick-links-section">
                <h3 className="section-title">Recent Bookings</h3>
                <div className="recent-bookings-list">
                  {recentBookings.map((booking) => (
                    <div key={booking._id} className="recent-booking-card">
                      <div className="recent-booking-user">
                        <div className="user-avatar-small">
                          {booking.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="user-info-small">
                          <h4>{booking.user?.name || 'Unknown'}</h4>
                          <p>{booking.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="recent-booking-details">
                        <span className="booking-slot-badge">{booking.slot}</span>
                        <span className="booking-date-text">
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Management Links */}
            <div className="quick-links-section">
              <h3 className="section-title">Management</h3>

              <div className="quick-links-grid">
                {/* All Bookings */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/admin")}
                >
                  <div className="link-icon">📋</div>
                  <h4>All Bookings</h4>
                  <p>View and manage bookings</p>
                </div>

                {/* QR Scanner - NEW */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/admin/scanner")}
                >
                  <div className="link-icon">📷</div>
                  <h4>QR Scanner</h4>
                  <p>Scan student QR codes</p>
                </div>

                {/* User Management */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/admin/users")}
                >
                  <div className="link-icon">👥</div>
                  <h4>User Management</h4>
                  <p>Add, edit, delete users</p>
                </div>

                {/* Gym Settings */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/admin/settings")}
                >
                  <div className="link-icon">⚙️</div>
                  <h4>Gym Settings</h4>
                  <p>Manage slots and schedules</p>
                </div>

                {/* Book Gym Slot */}
                <div
                  className="link-card clickable"
                  onClick={() => navigate("/booking")}
                >
                  <div className="link-icon">🏋️</div>
                  <h4>Gym Booking</h4>
                  <p>Book and manage slots</p>
                </div>

                {/* Reports - Coming Soon */}
                <div className="link-card">
                  <div className="link-icon">📊</div>
                  <h4>Reports & Analytics</h4>
                  <p>View detailed statistics</p>
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