import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { TextField, Button, Box, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Link, Stepper, Step, StepLabel } from '@mui/material';
import { LockResetSharp } from '@mui/icons-material';

function Login({ onLogin }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
    const [resetStep, setResetStep] = useState(0);
    const [forgotForm, setForgotForm] = useState({ email: '', dob: '' });
    const [resetForm, setResetForm] = useState({ token: '', newPassword: '', confirmPassword: '' });
    const [resetToken, setResetToken] = useState('');
    const navigate = useNavigate();

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleForgotChange = e => {
        setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });
    };

    const handleResetChange = e => {
        setResetForm({ ...resetForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await auth.login(form);
            localStorage.setItem('token', res.data.token);
            if (onLogin) {
                onLogin(res.data.user);
            }
            setSuccess('Login successful!');
            navigate('/'); // Redirect to home after login
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed.');
            setSuccess(''); // <-- Important!
        }
    };

    const handleForgotPassword = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await auth.forgotPassword(forgotForm);
            setResetToken(res.data.resetToken);
            setResetStep(1);
            setSuccess('Reset token generated! Please enter your new password.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate reset token.');
        }
    };

    const handleResetPassword = async e => {
        e.preventDefault();
        setError('');

        if (resetForm.newPassword !== resetForm.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (resetForm.newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        try {
            await auth.resetPassword({
                token: resetToken,
                newPassword: resetForm.newPassword
            });
            setSuccess('Password reset successfully! You can now login with your new password.');
            setResetStep(0);
            setForgotPasswordOpen(false);
            setForgotForm({ email: '', dob: '' });
            setResetForm({ token: '', newPassword: '', confirmPassword: '' });
            setResetToken('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        }
    };

    const handleCloseForgotPassword = () => {
        setForgotPasswordOpen(false);
        setResetStep(0);
        setError('');
        setSuccess('');
        setForgotForm({ email: '', dob: '' });
        setResetForm({ token: '', newPassword: '', confirmPassword: '' });
        setResetToken('');
    };

    const steps = ['Verify Identity', 'Reset Password'];

    return (
        <>
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
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                        Login
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => setForgotPasswordOpen(true)}
                            sx={{ cursor: 'pointer' }}
                        >
                            Forgot Password?
                        </Link>
                    </Box>
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </form>
            </Box>

            {/* Forgot Password Dialog */}
            <Dialog
                open={forgotPasswordOpen}
                onClose={handleCloseForgotPassword}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockResetSharp color="primary" />
                    Forgot Password
                </DialogTitle>
                <DialogContent>
                    <Stepper activeStep={resetStep} sx={{ mb: 3 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {resetStep === 0 && (
                        <Box>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Enter your email address and date of birth to verify your identity and generate a password reset token.
                            </Typography>
                            <form onSubmit={handleForgotPassword}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={forgotForm.email}
                                    onChange={handleForgotChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    value={forgotForm.dob}
                                    onChange={handleForgotChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ mb: 2 }}
                                />
                                <Button type="submit" variant="contained" fullWidth>
                                    Generate Reset Token
                                </Button>
                            </form>
                        </Box>
                    )}

                    {resetStep === 1 && (
                        <Box>
                            <form onSubmit={handleResetPassword}>
                                <TextField
                                    label="New Password"
                                    name="newPassword"
                                    type="password"
                                    value={resetForm.newPassword}
                                    onChange={handleResetChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                    helperText="Password must be at least 6 characters long"
                                />
                                <TextField
                                    label="Confirm New Password"
                                    name="confirmPassword"
                                    type="password"
                                    value={resetForm.confirmPassword}
                                    onChange={handleResetChange}
                                    fullWidth
                                    required
                                    sx={{ mb: 2 }}
                                />
                                <Button type="submit" variant="contained" fullWidth>
                                    Reset Password
                                </Button>
                            </form>
                        </Box>
                    )}

                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseForgotPassword}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Login;
