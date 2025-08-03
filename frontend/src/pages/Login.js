import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';

function Login({ onLogin }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, form);
            localStorage.setItem('token', res.data.token);
            if (onLogin) onLogin(res.data.user); // res.data.user = { firstName, lastName, email, ... }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed.');
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
            <Typography variant="h5" mb={2}>Login</Typography>
            <form onSubmit={handleSubmit} autoComplete="off">
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Login
                </Button>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </form>
        </Box>
    );
}

export default Login;
