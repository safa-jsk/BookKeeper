import React, { useState } from 'react';
import axios from 'axios';

function Register({ onRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, password });
            setSuccess('Registration successful! You can now log in.');
            setUsername('');
            setPassword('');
            if (onRegister) onRegister();
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <form onSubmit={handleRegister} style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
            <h2>Register</h2>
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
            <button type="submit" style={{ width: '100%', padding: 10 }}>Register</button>
            {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
            {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        </form>
    );
}

export default Register;
