// App.js - COMPLETE WITH ALL ROUTES

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/screens/Register';
import Login from './pages/screens/Login';
import Dashboard from './pages/screens/Dashboard';
import UserDashboard from './pages/screens/User/UserDashboard';
import Booking from "./pages/screens/booking";
import MyBookings from "./pages/screens/User/MyBookings";
import AdminPanel from "./pages/screens/Admin/AdminPanel";
import UserManagement from "./pages/screens/User/UserManagement";
import GymSettings from "./pages/screens/Admin/GymSettings";
import MyQRCode from "./pages/screens/User/MyQRCode";
import QRScanner from "./pages/screens/Admin/QRScanner";
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        
        {/* User routes (Protected) */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/user/dashboard" element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/booking" element={
          <PrivateRoute>
            <Booking />
          </PrivateRoute>
        } />

        <Route path="/my-bookings" element={
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        } />

        <Route path="/user/bookings" element={
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        } />

        <Route path="/user/qrcode" element={
          <PrivateRoute>
            <MyQRCode />
          </PrivateRoute>
        } />

        <Route path="/qrcode" element={
          <PrivateRoute>
            <MyQRCode />
          </PrivateRoute>
        } />
        
        {/* Admin routes (Admin only) */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />

        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />

        <Route path="/admin/settings" element={
          <AdminRoute>
            <GymSettings />
          </AdminRoute>
        } />

        <Route path="/admin/scanner" element={
          <AdminRoute>
            <QRScanner />
          </AdminRoute>
        } />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;