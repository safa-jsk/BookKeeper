// src/pages/AccountSettings.jsx
import React, { useEffect, useState } from 'react';
import {
    Box, Grid, Card, CardContent, CardHeader, TextField, Button, MenuItem,
    Typography, Snackbar, Alert, Avatar, Divider, Stack, Skeleton, Chip, Toolbar
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import LibraryApplicationDialog from '../components/LibraryApplicationDialog';
import LeftDrawer from '../components/LeftDrawer';

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

function AccountSettings({ user, onLogout }) {
    const theme = useTheme();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(user);

    const [profile, setProfile] = useState({
        firstName: '', lastName: '', gender: 'Male', dob: '', city: '', email: '', theme: 'scholarly'
    });
    const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const [applyOpen, setApplyOpen] = useState(false);

    const API = process.env.REACT_APP_API_URL;
    const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    const glass = {
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        background: alpha(theme.palette.background.paper, 0.6),
        boxShadow: `0 8px 30px ${alpha('#000', 0.08)}`,
        backdropFilter: 'blur(8px)',
    };

    // Determine if we're in admin context
    const isAdminContext = location.pathname.startsWith('/admin');

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
        } catch (err) {
            const msg = err?.response?.data?.message || 'Could not change password.';
            setSnack({ open: true, severity: 'error', message: msg });
        }
    };

    const onUploadAvatar = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setSnack({ open: true, severity: 'warning', message: 'File too large (max 5MB).' });
            return;
        }
        setAvatarPreview(URL.createObjectURL(file));
        const form = new FormData();
        form.append('avatar', file);
        try {
            const res = await axios.post(`${API}/api/user/me/avatar`, form, {
                ...authHeader(),
                headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' }
            });
            setMe(res.data);
            setSnack({ open: true, severity: 'success', message: 'Avatar updated.' });
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Avatar upload failed.' });
        }
    };

    const onDeleteAccount = async () => {
        if (!window.confirm('This will permanently delete your account. Continue?')) return;
        try {
            await axios.delete(`${API}/api/user/me`, authHeader());
            if (onLogout) {
                onLogout();
            } else {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Failed to delete account.' });
        }
    };

    // Loading state for both contexts
    if (loading) {
        if (isAdminContext) {
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
            <Box sx={{ pb: 6 }}>
                <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 4, md: 5 }, mb: 3 }}>
                    <Skeleton variant="rectangular" height={200} />
                </Box>
                <Grid container spacing={3} px={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} md={7}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Skeleton variant="rectangular" height={400} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Main content - unified UI for both contexts
    const mainContent = (
        <Box sx={{ pb: 6 }}>
            {/* Gradient hero */}
            <Box
                sx={{
                    px: { xs: 2, md: 3 },
                    py: { xs: 4, md: 5 },
                    borderRadius: 4,
                    mb: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.25)} 0%, ${alpha(theme.palette.secondary.main, 0.25)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: `0 10px 40px ${alpha('#000', 0.15)}`
                }}
            >
                <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                        src={avatarPreview || (me?.avatar ? `/${me.avatar}` : '')}
                        sx={{ width: 88, height: 88, border: `2px solid ${alpha('#fff', 0.6)}` }}
                    />

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            Account Settings
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            Manage your profile, security, and avatar.
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                            <Chip size="small" label={profile.email || '—'} />
                            {profile.city && <Chip size="small" label={profile.city} />}
                            <Chip size="small" label={me?.role || '—'} color="primary" />
                        </Stack>
                    </Box>

                    <Stack direction="row" spacing={1}>
                        {me?.role === 'reader' && (me?.librarianApplicationStatus === 'none' || me?.librarianApplicationStatus === 'rejected') && (
                            <Button
                                onClick={() => setApplyOpen(true)}
                                variant="contained"
                                sx={{ textTransform: 'none' }}
                            >
                                Apply to be a Librarian
                            </Button>
                        )}
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<PhotoCamera />}
                            sx={{ textTransform: 'none' }}
                        >
                            Change Avatar
                            <input hidden type="file" accept="image/*" onChange={onUploadAvatar} />
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Grid container spacing={3} px={{ xs: 2, md: 3 }}>
                {/* Profile card */}
                <Grid item xs={12} md={7}>
                    <Card sx={glass}>
                        <CardHeader
                            avatar={<PersonIcon color="primary" />}
                            title="Profile"
                            subheader="Update your personal information"
                        />
                        <CardContent>
                            <Box component="form" onSubmit={onSaveProfile}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="First Name" fullWidth required
                                            value={profile.firstName}
                                            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Last Name" fullWidth required
                                            value={profile.lastName}
                                            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select label="Gender" fullWidth required
                                            value={profile.gender}
                                            onChange={e => setProfile({ ...profile, gender: e.target.value })}
                                        >
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Date of Birth" type="date" InputLabelProps={{ shrink: true }}
                                            fullWidth required
                                            value={profile.dob}
                                            onChange={e => setProfile({ ...profile, dob: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select
                                            label="City"
                                            fullWidth
                                            required
                                            value={profile.city}
                                            onChange={e => setProfile({ ...profile, city: e.target.value })}
                                        >
                                            {cities.map(city => (
                                                <MenuItem key={city} value={city}>
                                                    {city}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField label="Email" fullWidth disabled value={profile.email} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select
                                            label="Theme"
                                            fullWidth
                                            value={profile.theme}
                                            onChange={e => setProfile({ ...profile, theme: e.target.value })}
                                        >
                                            <MenuItem value="scholarly">Scholarly Vibes — #4B3D2D</MenuItem>
                                            <MenuItem value="modernElegance">Modern Elegance — #3A2C2F</MenuItem>
                                            <MenuItem value="coastalCalm">Coastal Calm — #2E4053</MenuItem>
                                            <MenuItem value="rusticCharm">Rustic Charm — #4A3C2A</MenuItem>
                                            <MenuItem value="blueSerenity">Blue Serenity — #2C3E50</MenuItem>
                                            <MenuItem value="redPassion">Red Passion — #C0392B</MenuItem>
                                            <MenuItem value="blackWhite">Black & White — #000000</MenuItem>
                                            <MenuItem value="darkMode">Dark Mode — #121212</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>

                                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                    <Button type="submit" variant="contained" startIcon={<SaveIcon />} sx={{ textTransform: 'none' }}>
                                        Save Changes
                                    </Button>
                                </Stack>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Security + Danger Zone */}
                <Grid item xs={12} md={5}>
                    <Card sx={glass}>
                        <CardHeader
                            avatar={<SecurityIcon color="primary" />}
                            title="Security"
                            subheader="Change your password"
                        />
                        <CardContent>
                            <Box component="form" onSubmit={onChangePassword}>
                                <TextField
                                    type="password" label="Current Password" fullWidth required sx={{ mb: 2 }}
                                    value={security.currentPassword}
                                    onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                                />
                                <TextField
                                    type="password" label="New Password" fullWidth required sx={{ mb: 2 }}
                                    value={security.newPassword}
                                    onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                                />
                                <TextField
                                    type="password" label="Confirm New Password" fullWidth required sx={{ mb: 2 }}
                                    value={security.confirm}
                                    onChange={e => setSecurity({ ...security, confirm: e.target.value })}
                                />
                                <Button type="submit" variant="contained" sx={{ textTransform: 'none' }}>
                                    <EnhancedEncryptionIcon sx={{ mr: 1 }} />
                                    Update Password
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card sx={{ ...glass, mt: 3, borderColor: alpha(theme.palette.error.main, 0.4) }}>
                        <CardHeader title="Danger Zone" />
                        <CardContent>
                            <Typography color="text.secondary" sx={{ mb: 2 }}>
                                Permanently delete your account and all associated data.
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Button color="error" variant="contained" onClick={onDeleteAccount} sx={{ textTransform: 'none' }}>
                                    <DeleteForeverIcon sx={{ mr: 1 }} />Delete Account
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={snack.open}
                autoHideDuration={2600}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
            <LibraryApplicationDialog
                open={applyOpen}
                onClose={() => setApplyOpen(false)}
                apiBase={API}
                authHeader={authHeader}
                defaultCity={profile.city}
                onSubmitted={() => {
                    setMe(m => ({ ...m, librarianApplicationStatus: 'pending' }));
                    setSnack({ open: true, severity: 'success', message: 'Application submitted. You will be notified after review.' });
                }}
            />
        </Box>
    );

    // Return with appropriate layout wrapper
    if (isAdminContext) {
        return (
            <Box sx={{ display: 'flex' }}>
                <LeftDrawer user={me || user} />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    {mainContent}
                </Box>
            </Box>
        );
    }

    return mainContent;
}

export default AccountSettings;