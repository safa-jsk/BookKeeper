import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
            localStorage.setItem('token', res.data.token);
            if (onLogin) onLogin(res.data.username);
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <form onSubmit={handleLogin} style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2>Login</h2>
            <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                required
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
            />
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
            />
            <button type="submit" style={{ width: '100%', padding: 10 }}>Login</button>
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
    );
}

export default Login;
