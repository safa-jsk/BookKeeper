import React, { useState } from 'react';
import { auth } from '../services/api';
import { TextField, Button, MenuItem, Box, Typography, Alert, Grid } from '@mui/material';

const cities = [
    'Dhaka', 'Chattogram', 'Rajshahi', 'Barishal', 'Sylhet',
    'Khulna', 'Cumilla', 'Mymensingh', 'Rangpur', 'Gazipur'
];

function Register({ onRegister }) {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '',
        confirmPassword: '', gender: '', dob: '', city: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function validatePassword(pw) {
        return pw.length >= 8 && /[0-9]/.test(pw) && /[A-Z]/.test(pw);
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!validatePassword(form.password)) {
            setError('Password must be at least 8 characters, include an uppercase letter and a number.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!form.firstName || !form.lastName || !form.email || !form.gender || !form.dob || !form.city) {
            setError('Please fill out all fields.');
            return;
        }
        try {
            console.log('Sending registration request with data:', form);
            const response = await auth.register(form);
            console.log('Registration response:', response);
            setError('');
            setSuccess('Registration successful! You can now log in.');
            setForm({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', gender: '', dob: '', city: '' });
            if (onRegister) onRegister();
        } catch (err) {
            setSuccess('');
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Registration failed.';
            setError(errorMessage);
        }
    };

    return (
        <Box sx={{ maxWidth: 550, mx: 'auto', mt: 3, p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
            <Typography variant="h5" mb={2}>Register</Typography>
            <form onSubmit={handleSubmit} autoComplete="off">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Gender"
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={{
                                minWidth: { sm: 180, xs: '100%' },   // Fix width on desktop, responsive on mobile
                                maxWidth: { sm: 180, xs: '100%' },
                            }}
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="City"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            fullWidth
                            required
                            sx={{
                                minWidth: { sm: 180, xs: '100%' },
                                maxWidth: { sm: 180, xs: '100%' },
                            }}
                        >
                            {cities.map(city => <MenuItem key={city} value={city}>{city}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required
                            helperText="Min 8 chars, include number & uppercase letter" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} fullWidth required />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            </form>
        </Box>
    );
}

export default Register;
