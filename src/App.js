// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/screens/Register';
import Login from './pages/screens/Login';
import Dashboard from './pages/screens/Dashboard';
import Booking from "./pages/screens/booking";
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        
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

        <Route path="/my-qr" element={
          <PrivateRoute>
            <MyQRCode />
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

        <Route path="/admin/scanner" element={
          <AdminRoute>
            <QRScanner />
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;