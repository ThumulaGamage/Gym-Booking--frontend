// pages/screens/Admin/QRScanner.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../../api/api';
import '../../css/QRScanner.css';
import '../../css/Dashboard.css';

export default function QRScanner() {
  const [user, setUser] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScanner = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUser();
    fetchTodayAttendance();
    fetchStatistics();
  }, [fetchTodayAttendance, fetchStatistics]);

  useEffect(() => {
    if (scanning && !html5QrcodeScanner.current) {
      html5QrcodeScanner.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (html5QrcodeScanner.current) {
        html5QrcodeScanner.current.clear().catch(err => {
          console.error("Failed to clear scanner:", err);
        });
        html5QrcodeScanner.current = null;
      }
    };
  }, [scanning, onScanSuccess, onScanError]);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await API.get(`/qr/attendance?date=${today}`);
      setTodayAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await API.get('/qr/statistics');
      setStatistics(res.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  const onScanSuccess = useCallback(async (decodedText) => {
    setScanning(false);
    setMsg('Processing...');

    try {
      const res = await API.post('/qr/scan', { qrToken: decodedText });
      setResult({
        success: true,
        data: res.data
      });
      setMsg('✅ Check-in successful!');
      fetchTodayAttendance();
      fetchStatistics();
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.msg || 'Error processing QR code'
      });
      setMsg('❌ ' + (err.response?.data?.msg || 'Error processing QR code'));
    }
  }, [fetchTodayAttendance, fetchStatistics]);

  const onScanError = useCallback((error) => {
    // Ignore scan errors (they happen frequently while scanning)
  }, []);

  const startScanning = () => {
    setScanning(true);
    setResult(null);
    setMsg('');
  };

  const stopScanning = () => {
    setScanning(false);
    if (html5QrcodeScanner.current) {
      html5QrcodeScanner.current.clear();
      html5QrcodeScanner.current = null;
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
        <div className="qr-scanner-page">
          <h1 className="page-title">QR Code Scanner</h1>

          {/* Statistics */}
          {statistics && (
            <div className="scanner-stats">
              <div className="stat-card blue">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>{statistics.todayAttendances}</h3>
                  <p>Today's Check-ins</p>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <h3>{statistics.todayBookings}</h3>
                  <p>Today's Bookings</p>
                </div>
              </div>
              <div className="stat-card purple">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <h3>{statistics.attendanceRate}%</h3>
                  <p>Attendance Rate</p>
                </div>
              </div>
            </div>
          )}

          {msg && (
            <div className={`message ${msg.includes('✅') ? 'success' : 'error'}`}>
              {msg}
            </div>
          )}

          {/* Scanner Section */}
          <div className="content-card scanner-section">
            {!scanning && !result && (
              <div className="scanner-start">
                <div className="scanner-icon">📷</div>
                <h3>Ready to Scan</h3>
                <p>Click the button below to start scanning QR codes</p>
                <button className="start-scan-btn" onClick={startScanning}>
                  📸 Start Scanning
                </button>
              </div>
            )}

            {scanning && (
              <div className="scanner-active">
                <div id="qr-reader"></div>
                <button className="stop-scan-btn" onClick={stopScanning}>
                  ⏹️ Stop Scanning
                </button>
              </div>
            )}

            {result && (
              <div className={`scan-result ${result.success ? 'success' : 'error'}`}>
                {result.success ? (
                  <div className="result-success">
                    <div className="success-icon">✅</div>
                    <h3>Check-in Successful!</h3>
                    <div className="result-details">
                      <p><strong>Name:</strong> {result.data.attendance.user.name}</p>
                      <p><strong>Email:</strong> {result.data.attendance.user.email}</p>
                      {result.data.attendance.user.registrationNo && (
                        <p><strong>Reg No:</strong> {result.data.attendance.user.registrationNo}</p>
                      )}
                      {result.data.attendance.user.indexNo && (
                        <p><strong>Index No:</strong> {result.data.attendance.user.indexNo}</p>
                      )}
                      <p><strong>Slot:</strong> {result.data.booking.slot}</p>
                      <p><strong>Time:</strong> {new Date(result.data.attendance.checkInTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="result-error">
                    <div className="error-icon">❌</div>
                    <h3>Check-in Failed</h3>
                    <p>{result.error}</p>
                  </div>
                )}
                <button className="scan-again-btn" onClick={startScanning}>
                  🔄 Scan Another
                </button>
              </div>
            )}
          </div>

          {/* Today's Attendance */}
          <div className="content-card attendance-section">
            <h2>Today's Attendance ({todayAttendance.length})</h2>
            {todayAttendance.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Check-ins Yet</h3>
                <p>No one has checked in today.</p>
              </div>
            ) : (
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Reg No</th>
                      <th>Slot</th>
                      <th>Check-in Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.map((record) => (
                      <tr key={record._id}>
                        <td>{record.user.name}</td>
                        <td>{record.user.registrationNo || '-'}</td>
                        <td>{record.slot}</td>
                        <td>
                          {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td>
                          <span className={`status-badge ${record.status}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
//last