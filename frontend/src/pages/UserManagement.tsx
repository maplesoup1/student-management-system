import React, { useState, useEffect } from 'react';
import { userAPI, teacherAPI } from '../api';
import { User, Role } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    subject: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (teacherForm.password !== teacherForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setFormLoading(true);
    try {
      const userResponse = await userAPI.create({
        username: teacherForm.username,
        email: teacherForm.email,
        password: teacherForm.password,
        role: Role.TEACHER
      });

      await teacherAPI.create({
        name: teacherForm.name,
        subject: teacherForm.subject || 'Not Set',
        userId: userResponse.data.id,
        username: teacherForm.username
      });

      alert('Teacher account created successfully!');
      setTeacherForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        subject: ''
      });
      setShowCreateForm(false);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating teacher account');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-message">Loading users...</div>;
  }

  return (
    <div className="card">
      <div className="header">
        <h2>User Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Teacher Account'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Create Teacher Account</h3>
          <form onSubmit={handleCreateTeacher}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={teacherForm.username}
                  onChange={(e) => setTeacherForm({...teacherForm, username: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  value={teacherForm.confirmPassword}
                  onChange={(e) => setTeacherForm({...teacherForm, confirmPassword: e.target.value})}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                  placeholder="e.g., John Smith"
                  required
                />
              </div>
              <div className="form-group">
                <label>Subject (Optional)</label>
                <input
                  type="text"
                  value={teacherForm.subject}
                  onChange={(e) => setTeacherForm({...teacherForm, subject: e.target.value})}
                  placeholder="e.g., Mathematics, Physics"
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  Leave empty if subject will be set later
                </small>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create Teacher Account'}
            </button>
          </form>
        </div>
      )}

      <div className="responsive-table">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td><strong>{user.username}</strong></td>
                <td>{user.email || 'N/A'}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'badge-admin' : 
                    user.role === 'TEACHER' ? 'badge-teacher' : 'badge-student'
                  }`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;