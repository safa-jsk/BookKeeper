import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box, Stack, Typography, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Tabs, Tab, Chip, Tooltip, Divider, Card, CardContent, Fade
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { admin } from '../../services/api';

const STATUS = ['pending', 'approved', 'rejected'];

export default function AdminLibrarianApplications() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });
    const [confirm, setConfirm] = useState({ open: false, id: null, action: null, note: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await admin.listLibrarianApps(STATUS[tab]);
            setRows(data || []);
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Failed to load applications' });
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return rows;
        return rows.filter(r => {
            const name = `${r?.applicant?.firstName || ''} ${r?.applicant?.lastName || ''}`.toLowerCase();
            const phone = (typeof r.ownerPhone === 'string' ? r.ownerPhone : '').toLowerCase();
            return (
                (r.libraryName || '').toLowerCase().includes(needle) ||
                name.includes(needle) ||
                (r?.applicant?.email || '').toLowerCase().includes(needle) ||
                (r.city || '').toLowerCase().includes(needle) ||
                phone.includes(needle)
            );
        });
    }, [rows, q]);

    const openConfirm = (id, action) => setConfirm({ open: true, id, action, note: '' });
    const closeConfirm = () => setConfirm({ open: false, id: null, action: null, note: '' });

    const decide = async () => {
        try {
            await admin.decideLibrarianApp(confirm.id, confirm.action, confirm.note);
            setSnack({ open: true, severity: 'success', message: confirm.action === 'approve' ? 'Approved' : 'Rejected' });
            closeConfirm();
            load();
        } catch (e) {
            const msg = e?.response?.data?.message || 'Action failed';
            setSnack({ open: true, severity: 'error', message: msg });
        }
    };

    const chipColor = (s) => (s === 'pending' ? 'warning' : s === 'approved' ? 'success' : 'default');

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography
                    variant="h4"
                    sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
                >
                    Librarian Applications
                </Typography>
                <Tooltip title="Refresh">
                    <span>
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
                            Refresh
                        </Button>
                    </span>
                </Tooltip>
            </Stack>

            {/* Tabs */}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
                <Tab label="Pending" />
                <Tab label="Approved" />
                <Tab label="Rejected" />
            </Tabs>

            {/* Search */}
            <Stack direction="row" justifyContent="center" sx={{ mb: 3 }}>
                <TextField
                    placeholder="Search name, email, library, city, phone"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    size="small"
                    sx={{
                        width: { xs: '100%', sm: '80%', md: '60%' },
                        '& .MuiOutlinedInput-root': {
                            bgcolor: 'background.default',
                        }
                    }}
                    InputProps={{
                        sx: {
                            borderRadius: 2,
                            borderColor: theme.palette.info.main
                        }
                    }}
                />
            </Stack>

            {/* Results info */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {loading ? 'Loading…' : `${filtered.length} ${STATUS[tab]} application${filtered.length === 1 ? '' : 's'}`}
                </Typography>
            </Box>

            {/* List */}
            <Stack spacing={2}>
                {(!loading && filtered.length === 0) ? (
                    <Typography color="text.secondary" align="center">No applications found.</Typography>
                ) : (
                    filtered.map((app) => (
                        <Fade in key={app._id}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack
                                        direction={{ xs: 'column', md: 'row' }}
                                        justifyContent="space-between"
                                        gap={2}
                                    >
                                        {/* Left: details */}
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                                                {app.libraryName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                                {app.address1}{app.address2 ? `, ${app.address2}` : ''}, {app.city} {app.zip}
                                            </Typography>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                <strong>Applicant:</strong> {app.applicant?.firstName} {app.applicant?.lastName} · {app.applicant?.email}
                                            </Typography>
                                            <Typography variant="body2"><strong>Phone:</strong> {app.ownerPhone}</Typography>
                                            {Array.isArray(app.genres) && app.genres.length > 0 && (
                                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                    <strong>Genres:</strong> {app.genres.join(', ')}
                                                </Typography>
                                            )}
                                            {app.website && (
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                    <strong>Website:</strong> {app.website}
                                                </Typography>
                                            )}
                                            {app.about && (
                                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                    <strong>About:</strong> {app.about}
                                                </Typography>
                                            )}
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                Submitted: {new Date(app.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>

                                        {/* Right: status + actions */}
                                        <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1} sx={{ flexShrink: 0 }}>
                                            <Chip
                                                size="small"
                                                label={app.status?.toUpperCase()}
                                                color={chipColor(app.status)}
                                                sx={{ fontWeight: 600, letterSpacing: 0.4 }}
                                            />
                                            {tab === 0 && (
                                                <Stack direction="row" spacing={1}>
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<CheckIcon />}
                                                        onClick={() => openConfirm(app._id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<CloseIcon />}
                                                        onClick={() => openConfirm(app._id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Fade>
                    ))
                )}
            </Stack>

            {/* Confirm dialog */}
            <Dialog open={confirm.open} onClose={closeConfirm} fullWidth maxWidth="sm">
                <DialogTitle>
                    {confirm.action === 'approve' ? 'Approve Application' : 'Reject Application'}
                </DialogTitle>
                <DialogContent dividers>
                    {confirm.action === 'reject' ? (
                        <TextField
                            label="Review note (optional)"
                            fullWidth
                            multiline
                            minRows={3}
                            value={confirm.note}
                            onChange={e => setConfirm(s => ({ ...s, note: e.target.value }))}
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            This will grant the applicant the <strong>librarian</strong> role and automatically create their Library.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={confirm.action === 'approve' ? 'primary' : 'error'}
                        onClick={decide}
                    >
                        {confirm.action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Box>
    );
}
