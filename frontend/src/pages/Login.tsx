
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
            const data = await login({ username, password });
            onLogin(data);
            navigate('/');
        } catch (err: any) {
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
