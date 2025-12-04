// components/AdminRoute.js

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../api/api';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // You'll need to create this endpoint to verify admin status
      const res = await API.get('/auth/verify-admin');
      setIsAdmin(res.data.isAdmin);
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;