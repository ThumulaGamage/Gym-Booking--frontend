// pages/screens/User/MyBookings.js - DISPLAY ONLY (NO BUTTONS)

import React, { useState, useEffect } from 'react';
import API from '../../../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/Dashboard.css';
import '../../css/mybookings.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [user, setUser] = useState(null);
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
      console.error('Failed to load profile');
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
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
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Filter bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    bookingDate.setHours(0, 0, 0, 0);
    
    if (filter === 'upcoming') {
      return bookingDate >= today;
    } else if (filter === 'past') {
      return bookingDate < today;
    }
    return true; // 'all'
  });

  const upcomingCount = bookings.filter(b => {
    const d = new Date(b.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  }).length;

  const pastCount = bookings.filter(b => {
    const d = new Date(b.date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }).length;

  const isPastBooking = (dateStr) => {
    const bookingDate = new Date(dateStr);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate < today;
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
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">View your gym session bookings</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Booking Summary Stats */}
          {bookings.length > 0 && (
            <div className="bookings-summary">
              <div className="summary-card">
                <span className="icon">📊</span>
                <span className="value">{bookings.length}</span>
                <span className="label">Total Bookings</span>
              </div>
              <div className="summary-card">
                <span className="icon">📅</span>
                <span className="value">{upcomingCount}</span>
                <span className="label">Upcoming</span>
              </div>
              <div className="summary-card">
                <span className="icon">✓</span>
                <span className="value">{pastCount}</span>
                <span className="label">Completed</span>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          {bookings.length > 0 && (
            <div className="content-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="booking-filters" style={{ padding: '0 24px' }}>
                <button 
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Bookings
                  <span className="filter-count">{bookings.length}</span>
                </button>
                <button 
                  className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setFilter('upcoming')}
                >
                  Upcoming
                  <span className="filter-count">{upcomingCount}</span>
                </button>
                <button 
                  className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
                  onClick={() => setFilter('past')}
                >
                  Past
                  <span className="filter-count">{pastCount}</span>
                </button>
              </div>
            </div>
          )}

          {/* Bookings List - DISPLAY ONLY */}
          <div className="content-card">
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>
                  {filter === 'upcoming' 
                    ? 'No Upcoming Bookings' 
                    : filter === 'past' 
                    ? 'No Past Bookings'
                    : 'No Bookings Yet'}
                </h3>
                <p>
                  {filter === 'upcoming' 
                    ? "You don't have any upcoming gym sessions scheduled." 
                    : filter === 'past' 
                    ? "You haven't completed any gym sessions yet."
                    : "You haven't made any bookings yet."}
                </p>
              </div>
            ) : (
              <div className="bookings-list">
                {filteredBookings.map((booking) => {
                  const past = isPastBooking(booking.date);
                  return (
                    <div key={booking._id} className={`booking-card ${past ? 'past' : ''}`}>
                      <div className="booking-info">
                        <h3>
                          <span className="booking-slot-icon">🏋️</span>
                          {booking.slot}
                        </h3>
                        <div className="booking-date">
                          <span className="booking-date-icon">📅</span>
                          {new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="booking-details-row">
                          <div className="booking-detail-item">
                            <span className="icon">🕐</span>
                            <span>Time: {booking.slot}</span>
                          </div>
                          <div className="booking-detail-item">
                            <span className="icon">📍</span>
                            <span>Main Gym Floor</span>
                          </div>
                        </div>
                        {past ? (
                          <span className="past-badge">Completed</span>
                        ) : (
                          <span className="upcoming-badge">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}