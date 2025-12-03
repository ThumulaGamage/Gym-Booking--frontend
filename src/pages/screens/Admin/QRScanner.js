// pages/screens/QRScanner.js

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../../api/api';
import '../../css/QRScanner.css';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState('');
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const scannerRef = useRef(null);
  const html5QrcodeScanner = useRef(null);

  useEffect(() => {
    fetchTodayAttendance();
    fetchStatistics();
  }, []);

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
  }, [scanning]);

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await API.get(`/qr/attendance?date=${today}`);
      setTodayAttendance(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await API.get('/qr/statistics');
      setStatistics(res.data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const onScanSuccess = async (decodedText) => {
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
  };

  const onScanError = (error) => {
    // Ignore scan errors (they happen frequently while scanning)
  };

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

  return (
    <div className="qr-scanner-page">
      <h1 className="title">QR Code Scanner</h1>

      {/* Statistics */}
      {statistics && (
        <div className="scanner-stats">
          <div className="stat-card">
            <h3>{statistics.todayAttendances}</h3>
            <p>Today's Check-ins</p>
          </div>
          <div className="stat-card">
            <h3>{statistics.todayBookings}</h3>
            <p>Today's Bookings</p>
          </div>
          <div className="stat-card">
            <h3>{statistics.attendanceRate}%</h3>
            <p>Attendance Rate</p>
          </div>
        </div>
      )}

      {msg && (
        <div className={`message ${msg.includes('✅') ? 'success' : 'error'}`}>
          {msg}
        </div>
      )}

      {/* Scanner Section */}
      <div className="scanner-section">
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
      <div className="attendance-section">
        <h2>Today's Attendance ({todayAttendance.length})</h2>
        {todayAttendance.length === 0 ? (
          <p className="no-attendance">No check-ins yet today.</p>
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
  );
}