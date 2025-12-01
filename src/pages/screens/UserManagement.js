// pages/screens/UserManagement.js

import React, { useState, useEffect } from 'react';
import API from '../../api/api';
import '../css/UserManagement.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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
      const res = await API.post('/admin/users', formData);
      setMsg(res.data.msg);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'student' });
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
        role: formData.role
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
      role: user.role
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h1>User Management</h1>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          + Add New User
        </button>
      </div>

      {msg && (
        <div className={`message ${msg.includes('success') ? 'success' : 'error'}`}>
          {msg}
        </div>
      )}

      <div className="users-stats">
        <div className="stat-box">
          <h3>{users.filter(u => u.role === 'student').length}</h3>
          <p>Students</p>
        </div>
        <div className="stat-box">
          <h3>{users.filter(u => u.role === 'admin').length}</h3>
          <p>Admins</p>
        </div>
        <div className="stat-box">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user._id, user.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
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
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
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