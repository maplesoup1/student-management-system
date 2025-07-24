
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { User } from '../types';

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('=== LOGIN DEBUG ===');
            console.log('Attempting login with:', { username, password });
            const loginResponse = await login({ username, password });
            console.log('Login response received:', loginResponse);
            console.log('Token:', loginResponse.token);
            console.log('User:', loginResponse.user);
            
            // Store both token and user data
            localStorage.setItem('token', loginResponse.token);
            localStorage.setItem('user', JSON.stringify(loginResponse.user));
            
            console.log('Stored token:', localStorage.getItem('token'));
            console.log('Stored user:', localStorage.getItem('user'));
            
            onLogin(loginResponse.user);
            console.log('About to navigate to /');
            navigate('/');
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'An unexpected error occurred');
        }
    };

    return (
        <div className="auth-container">
            <div className="card">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
                <p>
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
