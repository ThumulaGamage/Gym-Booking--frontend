// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/screens/Register';
import Login from './pages/screens/Login';
import Dashboard from './pages/screens/Dashboard'; // Smart router - shows correct dashboard
import Booking from "./pages/screens/booking";
import MyBookings from "./pages/screens/MyBookings";
import AdminPanel from "./pages/screens/AdminPanel";
import UserManagement from "./pages/screens/UserManagement";
import GymSettings from "./pages/screens/GymSettings";
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        
        {/* Dashboard automatically shows UserDashboard or AdminDashboard based on role */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
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
        
        {/* Admin-only routes */}
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
      </Routes>
    </Router>
  );
}

export default App;