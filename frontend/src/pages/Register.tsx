
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api';
import { Role } from '../types';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<Role>(Role.STUDENT);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            await register({ username, email, password, role });
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} required />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => { setRole(e.target.value as Role); setError(''); }} disabled>
                            <option value={Role.STUDENT}>Student</option>
                        </select>
                        <small style={{color: '#666', fontSize: '0.8rem', marginTop: '0.5rem'}}>
                            Teachers are created by administrators
                        </small>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
