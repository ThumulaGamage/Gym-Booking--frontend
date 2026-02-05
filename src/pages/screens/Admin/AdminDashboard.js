// pages/screens/Admin/AdminDashboard.js

import React, { useEffect, useState } from 'react';
import API from '../../../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

      setRecentBookings(allBookings.slice(0, 5));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '📋', label: 'All Bookings', path: '/admin' },
    { icon: '📷', label: 'QR Scanner', path: '/admin/scanner' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
    { icon: '🏋️', label: 'Book Slot', path: '/booking' },
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
            {!sidebarCollapsed && <span className="logo-text">Gym Admin</span>}
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
            <div className="sidebar-avatar">
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
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Welcome back, {user?.name || 'Admin'}</p>
          </div>
        </div>

        {msg && <div className="error-message">{msg}</div>}

        {!user ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {/* Statistics Cards */}
            <div className="stats-row">
              <div className="stat-card-modern blue">
                <div className="stat-header">
                  <span className="stat-icon-modern">📊</span>
                  <span className="stat-trend">↑ 12%</span>
                </div>
                <h3 className="stat-number">{stats.totalBookings}</h3>
                <p className="stat-label">Total Bookings</p>
              </div>

              <div className="stat-card-modern green">
                <div className="stat-header">
                  <span className="stat-icon-modern">📅</span>
                  <span className="stat-trend success">↑ 8%</span>
                </div>
                <h3 className="stat-number">{stats.todayBookings}</h3>
                <p className="stat-label">Today's Bookings</p>
              </div>

              <div className="stat-card-modern purple">
                <div className="stat-header">
                  <span className="stat-icon-modern">👥</span>
                  <span className="stat-trend">↑ 5%</span>
                </div>
                <h3 className="stat-number">{stats.totalUsers}</h3>
                <p className="stat-label">Active Members</p>
              </div>
            </div>

            {/* Recent Bookings */}
            {recentBookings.length > 0 && (
              <div className="content-card">
                <div className="card-header">
                  <h3>Recent Bookings</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => navigate('/admin')}
                  >
                    View All →
                  </button>
                </div>
                <div className="bookings-table-wrapper">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div className="member-cell">
                              <div className="member-avatar-small">
                                {booking.user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className="member-name">
                                  {booking.user?.name || 'Unknown'}
                                </div>
                                <div className="member-email">
                                  {booking.user?.email || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td>
                            <span className="slot-badge">{booking.slot}</span>
                          </td>
                          <td>
                            <span className="status-badge active">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                  onClick={() => navigate('/admin/scanner')}
                >
                  <span className="action-icon">📷</span>
                  <span className="action-label">Scan QR Code</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/booking')}
                >
                  <span className="action-icon">➕</span>
                  <span className="action-label">New Booking</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/admin/users')}
                >
                  <span className="action-icon">👤</span>
                  <span className="action-label">Add User</span>
                </button>
                <button 
                  className="action-card"
                  onClick={() => navigate('/admin/settings')}
                >
                  <span className="action-icon">⚙️</span>
                  <span className="action-label">Configure</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}