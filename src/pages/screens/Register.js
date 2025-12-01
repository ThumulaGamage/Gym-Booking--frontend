// pages/screens/Register.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/api';
import '../css/Register.css';   // <-- keep your OLD style

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationNo: '',
    indexNo: '',
    batch: '',
    telNo: ''
  });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    name, email, password, confirmPassword,
    registrationNo, indexNo, batch, telNo
  } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg('');

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      setMsg('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    if (registrationNo && !/^EN\d{6}$/.test(registrationNo)) {
      setMsg('Registration No must be in format: EN100100');
      return;
    }
    if (indexNo && !/^\d{2}ENG\d{3}$/.test(indexNo)) {
      setMsg('Index No must be in format: 22ENG00');
      return;
    }
    if (batch && !/^\d{2}$/.test(batch)) {
      setMsg('Batch must be 2 digits');
      return;
    }
    if (telNo && !/^\d{10}$/.test(telNo)) {
      setMsg('Tel No must be 10 digits');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/auth/register', {
        name,
        email,
        password,
        registrationNo: registrationNo || null,
        indexNo: indexNo || null,
        batch: batch || null,
        telNo: telNo || null
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        {/* HEADER */}
        <div className="register-header">
          <div className="register-icon">💪</div>
          <h2 className="register-title">Create Account</h2>
          <p className="register-subtitle">Join our gym management system</p>
        </div>

        {/* ERROR MESSAGE */}
        {msg && <div className="error-message">{msg}</div>}

        {/* FORM */}
        <form onSubmit={onSubmit} className="register-form">

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              className="form-input"
              required
            />
          </div>

          {/* Registration + Index */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Registration No</label>
              <input
                name="registrationNo"
                value={registrationNo}
                onChange={onChange}
                placeholder="EN100100"
                maxLength="8"
                className="form-input"
              />
              <small className="form-hint">Format: EN100100</small>
            </div>

            <div className="form-group">
              <label className="form-label">Index No</label>
              <input
                name="indexNo"
                value={indexNo}
                onChange={onChange}
                placeholder="22ENG00"
                maxLength="8"
                className="form-input"
              />
              <small className="form-hint">Format: 22ENG00</small>
            </div>
          </div>

          {/* Batch + Telephone */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Batch</label>
              <input
                name="batch"
                value={batch}
                onChange={onChange}
                placeholder="07"
                maxLength="2"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tel No</label>
              <input
                name="telNo"
                value={telNo}
                onChange={onChange}
                placeholder="0771234567"
                maxLength="10"
                className="form-input"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter password"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Re-enter password"
              className="form-input"
              required
            />
          </div>

          {/* BUTTON */}
          <button className="register-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="register-footer">
          <p className="footer-text">
            Already have an account?
            <Link to="/login" className="login-link"> Sign in here</Link>
          </p>
        </div>

        {/* FEATURES BOX */}
        <div className="features-section">
          <h4 className="features-title">What you'll get:</h4>
          <ul className="features-list">
            <li>📅 Easy gym slot booking</li>
            <li>📱 Digital QR code access</li>
            <li>📊 Attendance tracking</li>
            <li>🏆 Fitness progress monitoring</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
