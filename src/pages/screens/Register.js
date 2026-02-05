// pages/screens/Register.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/api';
import '../css/Register.css';

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
    <div className="auth-container">
      <div className="auth-card register-card-extended">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon">💪</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our gym management system</p>
        </div>

        {/* Error Message */}
        {msg && <div className="error-message">{msg}</div>}

        {/* Form */}
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
              className="form-input"
              required
              disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
              placeholder="Enter password (min. 6 characters)"
              className="form-input"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {/* Button */}
          <button className="auth-button" disabled={loading}>
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

        {/* Footer */}
        <div className="auth-footer">
          <p className="footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in here</Link>
          </p>
        </div>

        {/* Features */}
        <div className="auth-features">
          <h4 className="features-title">What you'll get:</h4>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span className="feature-text">Easy Booking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span className="feature-text">QR Access</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Track Attendance</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">Progress Monitor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}