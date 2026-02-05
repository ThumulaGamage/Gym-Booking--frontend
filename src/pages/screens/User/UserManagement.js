// pages/screens/Admin/UserManagement.js - REFACTORED WITH MODERN LAYOUT

import React, { useState, useEffect } from 'react';
import API from '../../../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../css/Dashboard.css';
import '../../css/UserManagement.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    registrationNo: '',
    indexNo: '',
    batch: '',
    telNo: ''
  });

  useEffect(() => {
    fetchUser();
    fetchUsers();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load profile');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/admin/users', {
        ...formData,
        registrationNo: formData.registrationNo || null,
        indexNo: formData.indexNo || null,
        batch: formData.batch || null,
        telNo: formData.telNo || null
      });
      setMsg(res.data.msg);
      setShowAddModal(false);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'student',
        registrationNo: '',
        indexNo: '',
        batch: '',
        telNo: ''
      });
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error adding user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/admin/users/${selectedUser._id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registrationNo: formData.registrationNo || null,
        indexNo: formData.indexNo || null,
        batch: formData.batch || null,
        telNo: formData.telNo || null
      });
      setMsg(res.data.msg);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error updating user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This will also delete all their bookings.`)) {
      return;
    }

    try {
      const res = await API.delete(`/admin/users/${userId}`);
      setMsg(res.data.msg);
      fetchUsers();
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Error deleting user');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      registrationNo: user.registrationNo || '',
      indexNo: user.indexNo || '',
      batch: user.batch || '',
      telNo: user.telNo || ''
    });
    setShowEditModal(true);
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

        {/* User Profile in Sidebar */}
        {user && (
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <h4>{user.name}</h4>
                <span className="sidebar-role">{user.role}</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
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

        {/* Logout Button */}
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
        <div className="content-header">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Manage gym members and administrators</p>
          </div>
        </div>

        <div className="dashboard-grid">
        {/* Action Header */}
        <div className="content-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1a1d29' }}>
                User Database
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                {users.length} total users in the system
              </p>
            </div>
            <button className="primary-action-btn" onClick={() => setShowAddModal(true)}>
              <span>➕</span>
              Add New User
            </button>
          </div>
        </div>

        {/* Message Display */}
        {msg && (
          <div className={msg.includes('success') || msg.includes('added') || msg.includes('updated') || msg.includes('deleted') ? 'success-message' : 'error-message'}>
            {msg}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="stats-row">
          <div className="stat-card-modern blue">
            <div className="stat-header">
              <span className="stat-icon-modern">👥</span>
            </div>
            <h3 className="stat-number">{users.filter(u => u.role === 'student').length}</h3>
            <p className="stat-label">Students</p>
          </div>

          <div className="stat-card-modern purple">
            <div className="stat-header">
              <span className="stat-icon-modern">👨‍💼</span>
            </div>
            <h3 className="stat-number">{users.filter(u => u.role === 'admin').length}</h3>
            <p className="stat-label">Administrators</p>
          </div>

          <div className="stat-card-modern green">
            <div className="stat-header">
              <span className="stat-icon-modern">📊</span>
            </div>
            <h3 className="stat-number">{users.length}</h3>
            <p className="stat-label">Total Users</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="content-card">
          <div className="card-header">
            <h3>All Users</h3>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No Users Found</h3>
              <p>Start by adding your first user to the system.</p>
              <button className="primary-action-btn" onClick={() => setShowAddModal(true)}>
                Add First User
              </button>
            </div>
          ) : (
            <div className="bookings-table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Reg No</th>
                    <th>Index No</th>
                    <th>Batch</th>
                    <th>Tel No</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="member-cell">
                          <div className="member-avatar-small">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="member-name">{user.name}</div>
                            <div className="member-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${user.role === 'admin' ? 'admin-badge' : 'active'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.registrationNo || '-'}</td>
                      <td>{user.indexNo || '-'}</td>
                      <td>{user.batch || '-'}</td>
                      <td>{user.telNo || '-'}</td>
                      <td>
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="action-btn-edit"
                            onClick={() => openEditModal(user)}
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          <button
                            className="action-btn-delete"
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        </div>
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

    {/* Add User Modal */}
    {showAddModal && (
      <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="user@example.com"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Registration No</label>
                <input
                  type="text"
                  placeholder="EN100100"
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Index No</label>
                <input
                  type="text"
                  placeholder="22ENG00"
                  value={formData.indexNo}
                  onChange={(e) => setFormData({ ...formData, indexNo: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Batch</label>
                <input
                  type="text"
                  placeholder="07"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tel No</label>
                <input
                  type="text"
                  placeholder="0771234567"
                  value={formData.telNo}
                  onChange={(e) => setFormData({ ...formData, telNo: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {showEditModal && selectedUser && (
      <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Edit User</h2>
          <form onSubmit={handleEditUser}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Registration No</label>
                <input
                  type="text"
                  placeholder="EN100100"
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Index No</label>
                <input
                  type="text"
                  placeholder="22ENG00"
                  value={formData.indexNo}
                  onChange={(e) => setFormData({ ...formData, indexNo: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Batch</label>
                <input
                  type="text"
                  placeholder="07"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tel No</label>
                <input
                  type="text"
                  placeholder="0771234567"
                  value={formData.telNo}
                  onChange={(e) => setFormData({ ...formData, telNo: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button type="submit" className="primary">
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}