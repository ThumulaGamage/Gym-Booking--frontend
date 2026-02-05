// pages/screens/Admin/AdminPanel.js

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import API from "../../../api/api";
import "../../css/admin.css";
import "../../css/Dashboard.css";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSlot, setFilterSlot] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const slots = [
    "4:00 PM - 6:00 PM",
    "6:00 PM - 8:00 PM",
  ];

  useEffect(() => {
    fetchUser();
    fetchAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterSlot]);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

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

        {user && (
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <h4>{user.name}</h4>
                <span className="sidebar-role">{user.role}</span>
              </div>
            )}
          </div>
        )}

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
        <div className="admin-panel">
          <h1 className="title">All Bookings</h1>

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

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="content-card empty-state">
              <div className="empty-icon">📋</div>
              <h3>No Bookings Found</h3>
              <p>No bookings match your current filters.</p>
            </div>
          ) : (
            <div className="content-card">
              <div className="admin-bookings-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Reg No</th>
                      <th>Index No</th>
                      <th>Batch</th>
                      <th>Tel No</th>
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
                        <td>{booking.user?.registrationNo || '-'}</td>
                        <td>{booking.user?.indexNo || '-'}</td>
                        <td>{booking.user?.batch || '-'}</td>
                        <td>{booking.user?.telNo || '-'}</td>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}