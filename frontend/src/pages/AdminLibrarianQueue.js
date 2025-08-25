import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box, Card, CardHeader, CardContent, Tabs, Tab, TextField, Stack, IconButton, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Typography, Chip, Snackbar, Alert, Tooltip, Divider
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { admin } from '../services/api';

const STATUS = ['pending', 'approved', 'rejected'];

export default function AdminLibrarianQueue() {
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
        } catch (e) {
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
            return (
                r.libraryName?.toLowerCase().includes(needle) ||
                name.includes(needle) ||
                r?.applicant?.email?.toLowerCase().includes(needle) ||
                r.city?.toLowerCase().includes(needle) ||
                r.ownerPhone?.toLowerCase?.().includes(needle)
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

    return (
        <Box p={3}>
            <Card>
                <CardHeader
                    title="Librarian Applications"
                    subheader="Review and approve/reject librarian applications"
                    action={
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton onClick={load} disabled={loading}>
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    }
                />
                <CardContent>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                        <Tab label={`Pending`} />
                        <Tab label={`Approved`} />
                        <Tab label={`Rejected`} />
                    </Tabs>

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search name, email, library, city, phone"
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} /> }}
                            fullWidth
                        />
                    </Stack>

                    <Stack spacing={2}>
                        {filtered.length === 0 ? (
                            <Typography color="text.secondary">{loading ? 'Loading…' : 'No applications found.'}</Typography>
                        ) : filtered.map(app => (
                            <Card key={app._id} variant="outlined">
                                <CardContent>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
                                        <Box>
                                            <Typography variant="h6">{app.libraryName}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {app.address1}{app.address2 ? `, ${app.address2}` : ''}, {app.city} {app.zip}
                                            </Typography>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Typography variant="body2">
                                                <strong>Applicant:</strong> {app.applicant?.firstName} {app.applicant?.lastName} · {app.applicant?.email}
                                            </Typography>
                                            <Typography variant="body2"><strong>Phone:</strong> {app.ownerPhone}</Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                <strong>Genres:</strong> {(app.genres || []).join(', ')}
                                            </Typography>
                                            {app.website && (
                                                <Typography variant="body2"><strong>Website:</strong> {app.website}</Typography>
                                            )}
                                            {app.about && (
                                                <Typography variant="body2"><strong>About:</strong> {app.about}</Typography>
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                Submitted: {new Date(app.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>

                                        <Stack alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={1}>
                                            <Chip
                                                size="small"
                                                label={app.status.toUpperCase()}
                                                color={app.status === 'pending' ? 'warning' : app.status === 'approved' ? 'success' : 'default'}
                                                sx={{ alignSelf: { xs: 'flex-start', md: 'flex-end' } }}
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
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Confirm dialog */}
            <Dialog open={confirm.open} onClose={closeConfirm} fullWidth maxWidth="sm">
                <DialogTitle>
                    {confirm.action === 'approve' ? 'Approve Application' : 'Reject Application'}
                </DialogTitle>
                <DialogContent dividers>
                    {confirm.action === 'reject' && (
                        <TextField
                            label="Review note (optional)"
                            fullWidth
                            multiline
                            minRows={3}
                            value={confirm.note}
                            onChange={e => setConfirm(s => ({ ...s, note: e.target.value }))}
                        />
                    )}
                    {confirm.action === 'approve' && (
                        <Typography variant="body2" color="text.secondary">
                            This will grant the applicant the <strong>librarian</strong> role and automatically create their Library.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancel</Button>
                    <Button variant="contained" color={confirm.action === 'approve' ? 'primary' : 'error'} onClick={decide}>
                        {confirm.action === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
