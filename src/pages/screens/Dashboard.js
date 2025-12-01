// pages/screens/Dashboard.js
// This component routes to correct dashboard based on user role
// REPLACE your existing Dashboard.js with this

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../../api/api';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-background">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route based on role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}