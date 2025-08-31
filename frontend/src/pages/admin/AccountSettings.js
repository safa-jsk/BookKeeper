import React, { useEffect, useState } from 'react';
import {
    Box, Grid, Card, CardContent, CardHeader, TextField, Button, MenuItem,
    Typography, Snackbar, Alert, Avatar, Divider, Stack, Skeleton
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Toolbar } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import LeftDrawer from '../../components/LeftDrawer';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EnhancedEncryptionIcon from '@mui/icons-material/EnhancedEncryption';

const cities = [
    'Dhaka', 'Chattogram', 'Rajshahi', 'Barishal', 'Sylhet',
    'Khulna', 'Cumilla', 'Mymensingh', 'Rangpur', 'Gazipur'
];

export default function AdminAccountSettings({ user, onLogout }) {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(user);

    const [profile, setProfile] = useState({
        firstName: '', lastName: '', gender: 'Male', dob: '', city: '', email: '', theme: 'scholarly'
    });
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const API = process.env.REACT_APP_API_URL;
    const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    const glass = {
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        background: alpha(theme.palette.background.paper, 0.6),
        boxShadow: `0 8px 30px ${alpha('#000', 0.08)}`,
        backdropFilter: 'blur(8px)',
    };

    useEffect(() => {
        (async () => {
            try {
                if (!me) {
                    const res = await axios.get(`${API}/api/user/me`, authHeader());
                    setMe(res.data);
                }
                setProfile({
                    firstName: me?.firstName || '',
                    lastName: me?.lastName || '',
                    gender: me?.gender || 'Male',
                    dob: me?.dob ? dayjs(me.dob).format('YYYY-MM-DD') : '',
                    city: me?.city || '',
                    email: me?.email || '',
                    theme: me?.theme || 'scholarly'
                });
            } catch {
                setSnack({ open: true, severity: 'error', message: 'Failed to load profile.' });
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me]);

    const onSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const resp = await axios.put(`${API}/api/user/me`, {
                firstName: profile.firstName,
                lastName: profile.lastName,
                gender: profile.gender,
                dob: profile.dob,
                city: profile.city,
                theme: profile.theme
            }, authHeader());
            // Persist theme locally and notify app to apply without reload
            try {
                const saved = JSON.parse(localStorage.getItem('user') || '{}');
                saved.theme = resp?.data?.theme || profile.theme;
                localStorage.setItem('user', JSON.stringify(saved));
                window.dispatchEvent(new Event('user-theme-updated'));
            } catch { }
            setSnack({ open: true, severity: 'success', message: 'Profile updated.' });
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Could not update profile.' });
        }
    };

    const onChangePassword = async (e) => {
        e.preventDefault();
        if (security.newPassword !== security.confirm) {
            setSnack({ open: true, severity: 'warning', message: 'New passwords do not match.' });
            return;
        }
        try {
            await axios.patch(`${API}/api/user/me/password`, {
                currentPassword: security.currentPassword,
                newPassword: security.newPassword
            }, authHeader());
            setSecurity({ currentPassword: '', newPassword: '', confirm: '' });
            setSnack({ open: true, severity: 'success', message: 'Password changed.' });
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Could not change password.' });
        }
    };

    const onUploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setSnack({ open: true, severity: 'warning', message: 'File too large (max 5MB).' });
            return;
        }
        setAvatarPreview(URL.createObjectURL(file));
        try {
            const form = new FormData();
            form.append('avatar', file);
            await axios.post(`${API}/api/user/me/avatar`, form, {
                ...authHeader(),
                headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            setSnack({ open: true, severity: 'success', message: 'Avatar updated.' });
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Could not upload avatar.' });
        }
    };

    const onDeleteAccount = async () => {
        if (!window.confirm('Are you sure? This action cannot be undone.')) return;
        try {
            await axios.delete(`${API}/api/user/me`, authHeader());
            onLogout();
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Could not delete account.' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex' }}>
                <LeftDrawer user={me || user} />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={200} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Skeleton variant="rectangular" height={200} />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <LeftDrawer user={me || user} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />

                <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700, mb: 4 }}>
                    Account Settings
                </Typography>

                <Grid container spacing={3}>
                    {/* Profile Section */}
                    <Grid item xs={12} md={6}>
                        <Card sx={glass}>
                            <CardHeader
                                title={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <PersonIcon color="primary" />
                                        <Typography variant="h6">Profile Information</Typography>
                                    </Stack>
                                }
                            />
                            <CardContent>
                                <Box component="form" onSubmit={onSaveProfile}>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="First Name"
                                            value={profile.firstName}
                                            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Last Name"
                                            value={profile.lastName}
                                            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            select
                                            label="Gender"
                                            value={profile.gender}
                                            onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                            fullWidth
                                        >
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </TextField>
                                        <TextField
                                            label="Date of Birth"
                                            type="date"
                                            value={profile.dob}
                                            onChange={e => setProfile({ ...profile, dob: e.target.value })}
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <TextField
                                            select
                                            label="City"
                                            value={profile.city}
                                            onChange={e => setProfile({ ...profile, city: e.target.value })}
                                            fullWidth
                                        >
                                            {cities.map(city => (
                                                <MenuItem key={city} value={city}>{city}</MenuItem>
                                            ))}
                                        </TextField>
                                        <TextField
                                            label="Email"
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            fullWidth
                                            helperText="Email cannot be changed"
                                        />
                                        <TextField
                                            select
                                            label="Theme"
                                            value={profile.theme}
                                            onChange={e => setProfile({ ...profile, theme: e.target.value })}
                                            fullWidth
                                        >
                                            <MenuItem value="scholarly">Scholarly</MenuItem>
                                            <MenuItem value="cozy">Cozy</MenuItem>
                                            <MenuItem value="modern">Modern</MenuItem>
                                            <MenuItem value="classic">Classic</MenuItem>
                                        </TextField>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<SaveIcon />}
                                            fullWidth
                                        >
                                            Save Profile
                                        </Button>
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Security Section */}
                    <Grid item xs={12} md={6}>
                        <Card sx={glass}>
                            <CardHeader
                                title={
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <SecurityIcon color="primary" />
                                        <Typography variant="h6">Security</Typography>
                                    </Stack>
                                }
                            />
                            <CardContent>
                                <Box component="form" onSubmit={onChangePassword}>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Current Password"
                                            type="password"
                                            value={security.currentPassword}
                                            onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="New Password"
                                            type="password"
                                            value={security.newPassword}
                                            onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                                            fullWidth
                                            required
                                        />
                                        <TextField
                                            label="Confirm New Password"
                                            type="password"
                                            value={security.confirm}
                                            onChange={e => setSecurity({ ...security, confirm: e.target.value })}
                                            fullWidth
                                            required
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={<EnhancedEncryptionIcon />}
                                            fullWidth
                                        >
                                            Change Password
                                        </Button>
                                    </Stack>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* Avatar Section */}
                                <Stack spacing={2}>
                                    <Typography variant="h6">Profile Picture</Typography>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Avatar
                                            src={avatarPreview || me?.avatar}
                                            sx={{ width: 80, height: 80 }}
                                        />
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<PhotoCamera />}
                                        >
                                            Upload Photo
                                            <input
                                                hidden
                                                accept="image/*"
                                                type="file"
                                                onChange={onUploadAvatar}
                                            />
                                        </Button>
                                    </Stack>
                                </Stack>

                                <Divider sx={{ my: 3 }} />

                                {/* Danger Zone */}
                                <Stack spacing={2}>
                                    <Typography variant="h6" color="error">
                                        Danger Zone
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteForeverIcon />}
                                        onClick={onDeleteAccount}
                                        fullWidth
                                    >
                                        Delete Account
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snack.open}
                    autoHideDuration={6000}
                    onClose={() => setSnack({ ...snack, open: false })}
                >
                    <Alert
                        onClose={() => setSnack({ ...snack, open: false })}
                        severity={snack.severity}
                        sx={{ width: '100%' }}
                    >
                        {snack.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}
