import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';

const CreateAdmin: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: Role.ADMIN
        })
      });

      if (response.ok) {
        alert('✅ Admin user created successfully! You can now login.');
        navigate('/login');
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to create admin user');
      }
    } catch (err: any) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>🛡️ Create Admin User</h2>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Create the first admin user for the system. This page will be disabled after the first admin is created.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => {
                setFormData({ ...formData, username: e.target.value });
                setError('');
              }}
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError('');
              }}
              placeholder="Enter admin email (optional)"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError('');
              }}
              placeholder="Enter secure password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setError('');
              }}
              placeholder="Confirm password"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Creating Admin...' : '🛡️ Create Admin User'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Already have an admin account? <a href="/login" style={{ color: '#007bff' }}>Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;