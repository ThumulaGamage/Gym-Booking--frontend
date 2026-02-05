// pages/screens/User/MyQRCode.js - REFACTORED WITH MODERN LAYOUT

import React, { useState, useEffect } from 'react';
import API from '../../../api/api';
import QRCode from 'qrcode';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/Dashboard.css';
import '../../css/QRCode.css';

export default function MyQRCode() {
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [myAttendance, setMyAttendance] = useState([]);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
    fetchMyAttendance();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && qrData) {
      setMsg('QR code expired. Please generate a new one.');
      setQrData(null);
      setQrImage('');
    }
  }, [countdown, qrData]);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const fetchMyAttendance = async () => {
    try {
      const res = await API.get('/qr/my-attendance');
      setMyAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setMsg('');

      const res = await API.get('/qr/generate');
      const qrTokenData = res.data;
      
      console.log('QR Response:', qrTokenData); // Debug log

      // Generate QR code image from the token
      const qrImageUrl = await QRCode.toDataURL(qrTokenData.qrToken, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      console.log('QR Image generated:', qrImageUrl); // Debug log

      setQrImage(qrImageUrl);
      setQrData(qrTokenData);
      setCountdown(300); // 5 minutes
      setMsg('QR code generated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error('QR Generation Error:', err); // Debug log
      setMsg(err.response?.data?.msg || 'Error generating QR code');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/user/dashboard' },
    { icon: '🏋️', label: 'Book Slot', path: '/booking' },
    { icon: '📋', label: 'My Bookings', path: '/user/bookings' },
    { icon: '📱', label: 'My QR Code', path: '/user/qrcode' },
    { icon: '👤', label: 'Profile', path: '/user/profile' },
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
            <h1 className="page-title">My QR Code</h1>
            <p className="page-subtitle">Generate and manage your gym check-in QR code</p>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Success/Error Message */}
          {msg && (
            <div className={`message ${msg.includes('success') ? 'success' : 'error-message'}`}>
              {msg}
            </div>
          )}

          {/* Info Banner */}
          <div className="qr-info-banner">
            <span className="icon">ℹ️</span>
            <div className="content">
              <h4>How to Use QR Code</h4>
              <p>Generate a QR code to check in at the gym. Show it to the admin for scanning. Valid for 5 minutes.</p>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="content-card">
            <div className="qr-section">
              {!qrData ? (
                <div className="qr-generate">
                  <div className="qr-info">
                    <h3>📱 Generate Your QR Code</h3>
                    <p>Create a secure QR code to check in at the gym facility.</p>
                    <ul className="qr-instructions">
                      <li>QR code is valid for 5 minutes only</li>
                      <li>Show this code to the admin for scanning</li>
                      <li>Must have an active booking for today</li>
                      <li>One QR code per check-in session</li>
                    </ul>
                  </div>
                  <button 
                    className="generate-btn" 
                    onClick={generateQRCode}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '3px' }}></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        🔄 Generate QR Code
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="qr-display">
                  <div className="qr-header">
                    <h3>✅ Show this to Admin</h3>
                    <div className="qr-timer">
                      <span className="timer-icon">⏱️</span>
                      <span className="timer-text">{formatCountdown(countdown)}</span>
                    </div>
                  </div>

                  <div className="qr-code-container">
                    {qrImage ? (
                      <img src={qrImage} alt="QR Code" className="qr-image" />
                    ) : (
                      <div className="qr-loading">
                        <div className="qr-loading-spinner"></div>
                        <p>Loading QR Code...</p>
                      </div>
                    )}
                  </div>

                  <div className="qr-user-info">
                    <h4>{qrData.userData.name}</h4>
                    <p>{qrData.userData.email}</p>
                    {qrData.userData.registrationNo && (
                      <p>Registration: {qrData.userData.registrationNo}</p>
                    )}
                    {qrData.userData.indexNo && (
                      <p>Index Number: {qrData.userData.indexNo}</p>
                    )}
                  </div>

                  <button className="refresh-btn" onClick={generateQRCode}>
                    🔄 Generate New QR Code
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Attendance History */}
          <div className="content-card attendance-section">
            <div className="card-header">
              <h3>My Attendance History</h3>
            </div>
            
            {myAttendance.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Attendance Records</h3>
                <p>You haven't checked in at the gym yet. Generate a QR code and scan it to mark your attendance.</p>
              </div>
            ) : (
              <div className="attendance-list">
                {myAttendance.map((record) => (
                  <div key={record._id} className="attendance-card">
                    <div className="attendance-info">
                      <h4>{record.slot}</h4>
                      <p className="attendance-date">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="check-in-time">
                        {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                      {record.scannedBy && (
                        <p className="scanned-by">
                          {record.scannedBy.name}
                        </p>
                      )}
                    </div>
                    <span className={`status-badge ${record.status}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}