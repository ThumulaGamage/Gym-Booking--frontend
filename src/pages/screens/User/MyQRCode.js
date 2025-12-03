// pages/screens/MyQRCode.js

import React, { useState, useEffect } from 'react';
import API from '../../../api/api';
import QRCode from 'qrcode';
import '../../css/QRCode.css';

export default function MyQRCode() {
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [myAttendance, setMyAttendance] = useState([]);

  useEffect(() => {
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
      setQrData(res.data);

      // Generate QR code image
      const qrImageUrl = await QRCode.toDataURL(res.data.qrToken, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrImage(qrImageUrl);
      setCountdown(300); // 5 minutes
      setMsg('QR code generated successfully!');
    } catch (err) {
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

  return (
    <div className="qr-code-page">
      <h1 className="title">My QR Code</h1>

      {msg && (
        <div className={`message ${msg.includes('success') ? 'success' : 'error'}`}>
          {msg}
        </div>
      )}

      <div className="qr-section">
        {!qrData ? (
          <div className="qr-generate">
            <div className="qr-info">
              <h3>📱 Generate Your QR Code</h3>
              <p>Generate a QR code to check in at the gym.</p>
              <ul className="qr-instructions">
                <li>QR code is valid for 5 minutes</li>
                <li>Show this code to the admin for scanning</li>
                <li>Must have a booking for today</li>
              </ul>
            </div>
            <button 
              className="generate-btn" 
              onClick={generateQRCode}
              disabled={loading}
            >
              {loading ? 'Generating...' : '🔄 Generate QR Code'}
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
              {qrImage && <img src={qrImage} alt="QR Code" className="qr-image" />}
            </div>

            <div className="qr-user-info">
              <h4>{qrData.userData.name}</h4>
              <p>{qrData.userData.email}</p>
              {qrData.userData.registrationNo && (
                <p>Reg: {qrData.userData.registrationNo}</p>
              )}
              {qrData.userData.indexNo && (
                <p>Index: {qrData.userData.indexNo}</p>
              )}
            </div>

            <button className="refresh-btn" onClick={generateQRCode}>
              🔄 Generate New QR Code
            </button>
          </div>
        )}
      </div>

      {/* My Attendance History */}
      <div className="attendance-section">
        <h2>My Attendance History</h2>
        {myAttendance.length === 0 ? (
          <p className="no-attendance">No attendance records yet.</p>
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
                    Check-in: {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {record.scannedBy && (
                    <p className="scanned-by">Scanned by: {record.scannedBy.name}</p>
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
  );
}