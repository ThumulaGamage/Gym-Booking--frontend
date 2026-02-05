// pages/screens/User/UserDashboard.js - UPDATED WITH QR CODE

import React, { useEffect, useState } from 'react';
import API from '../../../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/Dashboard.css';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [msg, setMsg] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
    fetchBookings();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      setMsg('Failed to load profile');
    }
  };

  const fetchBookings = async () => {
    try {
      // Changed from '/bookings/my-bookings' to '/bookings' which should work
      const res = await API.get('/bookings');
      const allBookings = res.data;
      setBookings(allBookings);

      // Filter upcoming bookings (today and future)
      const today = new Date().toISOString().split('T')[0];
      const upcoming = allBookings.filter(b => b.date >= today);
      setUpcomingBookings(upcoming.slice(0, 5));
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Don't show error to user if bookings fail - just show empty state
      setBookings([]);
      setUpcomingBookings([]);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '🏋️', label: 'Book Gym', path: '/booking' },
    { icon: '📅', label: 'My Bookings', path: '/my-bookings' },
    { icon: '📱', label: 'My QR Code', path: '/user/qrcode' },
    { icon: '👤', label: 'Profile', path: '/profile' },
  ];

  const isActiveRoute = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="modern-dashboard">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🏋️</span>
            {!sidebarCollapsed && <span className="logo-text">Gym Portal</span>}
          </div>
          <button 
            className="collapse-btn" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Profile in Sidebar */}
        {user && (
          <div className="sidebar-profile">
            <div className="sidebar-avatar user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <h4>{user.name}</h4>
                <span className="sidebar-role">{user.role}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`nav-item ${isActiveRoute(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button 
            className="logout-sidebar-btn" 
            onClick={logout}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <div>
            <h1 className="page-title">My Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name || 'Member'}</p>
          </div>
          <button 
            className="primary-action-btn"
            onClick={() => navigate('/booking')}
          >
            <span>📅</span> Book Now
          </button>
        </div>

        {msg && <div className="error-message">{msg}</div>}

        {!user ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* User Info Card */}
            <div className="content-card user-info-card">
              <div className="card-header">
                <h3>My Profile</h3>
                <button 
                  className="view-all-btn"
                  onClick={() => navigate('/profile')}
                >
                  Edit →
                </button>
              </div>
              <div className="user-details-grid">
                <div className="detail-box">
                  <span className="detail-icon">📧</span>
                  <div>
                    <p className="detail-label">Email</p>
                    <p className="detail-value">{user.email}</p>
                  </div>
                </div>
                {user.registrationNo && (
                  <div className="detail-box">
                    <span className="detail-icon">🎓</span>
                    <div>
                      <p className="detail-label">Registration No</p>
                      <p className="detail-value">{user.registrationNo}</p>
                    </div>
                  </div>
                )}
                {user.batch && (
                  <div className="detail-box">
                    <span className="detail-icon">📚</span>
                    <div>
                      <p className="detail-label">Batch</p>
                      <p className="detail-value">{user.batch}</p>
                    </div>
                  </div>
                )}
                {user.telNo && (
                  <div className="detail-box">
                    <span className="detail-icon">📱</span>
                    <div>
                      <p className="detail-label">Phone</p>
                      <p className="detail-value">{user.telNo}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-card-modern blue">
                <div className="stat-header">
                  <span className="stat-icon-modern">📊</span>
                </div>
                <h3 className="stat-number">{bookings.length}</h3>
                <p className="stat-label">Total Bookings</p>
              </div>

              <div className="stat-card-modern green">
                <div className="stat-header">
                  <span className="stat-icon-modern">📅</span>
                </div>
                <h3 className="stat-number">{upcomingBookings.length}</h3>
                <p className="stat-label">Upcoming Sessions</p>
              </div>

              <div className="stat-card-modern purple">
                <div className="stat-header">
                  <span className="stat-icon-modern">🏆</span>
                </div>
                <h3 className="stat-number">{bookings.length > 0 ? Math.min(bookings.length * 5, 100) : 0}%</h3>
                <p className="stat-label">Activity Score</p>
              </div>
            </div>

            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 ? (
              <div className="content-card">
                <div className="card-header">
                  <h3>Upcoming Sessions</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => navigate('/my-bookings')}
                  >
                    View All →
                  </button>
                </div>
                <div className="upcoming-bookings-list">
                  {upcomingBookings.map((booking) => {
                    const bookingDate = new Date(booking.date);
                    return (
                      <div key={booking._id} className="upcoming-booking-card">
                        <div className="booking-date-badge">
                          <div className="date-day">
                            {bookingDate.getDate()}
                          </div>
                          <div className="date-month">
                            {bookingDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div className="booking-details">
                          <h4 className="booking-slot-title">
                            <span className="slot-time">{booking.slot}</span>
                          </h4>
                          <p className="booking-date-text">
                            {bookingDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="booking-status">
                          <span className="status-badge active">Confirmed</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="content-card empty-state">
                <div className="empty-icon">📅</div>
                <h3>No Upcoming Sessions</h3>
                <p>You don't have any gym sessions booked yet.</p>
                <button 
                  className="primary-action-btn"
                  onClick={() => navigate('/booking')}
                >
                  Book Your First Session
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="content-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions-grid">
                <button 
                  className="action-card"
                  onClick={() => navigate('/booking')}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-label">New Booking</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/my-bookings')}
                >
                  <span className="action-icon">📋</span>
                  <span className="action-label">View Bookings</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/profile')}
                >
                  <span className="action-icon">👤</span>
                  <span className="action-label">Edit Profile</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/user/qrcode')}
                >
                  <span className="action-icon">📱</span>
                  <span className="action-label">My QR Code</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}