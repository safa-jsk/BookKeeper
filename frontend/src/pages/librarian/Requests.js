import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardHeader, CardContent, Stack, Typography, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { requests } from '../../services/api';

const STATUS = ['pending', 'approved', 'rejected', 'delayed'];

export default function LibrarianRequests({ libraryId }) {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });
    const [delayOpen, setDelayOpen] = useState(false);
    const [delayDays, setDelayDays] = useState(3);
    const [delayTarget, setDelayTarget] = useState(null);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!libraryId) return;
        setLoading(true);
        try {
            const { data } = await requests.listForLibrary(libraryId, STATUS[tab]);
            setRows(data || []);
        } finally {
            setLoading(false);
        }
    }, [libraryId, tab]);

    useEffect(() => {
        if (libraryId) load();
    }, [libraryId, load]);

    const approve = async (id) => {
        try {
            await requests.approve(libraryId, id);
            setSnack({ open: true, severity: 'success', message: 'Approved & stock updated' });
            setRows(rows => rows.filter(r => r._id !== id));
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to approve' });
        }
    };

    const reject = async (id) => {
        try {
            await requests.reject(libraryId, id);
            setSnack({ open: true, severity: 'info', message: 'Rejected' });
            setRows(rows => rows.filter(r => r._id !== id));
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to reject' });
        }
    };

    const openDelay = (id) => {
        setDelayTarget(id);
        setDelayDays(3);
        setDelayOpen(true);
    };

    const confirmDelay = async () => {
        try {
            await requests.delay(libraryId, delayTarget, Number(delayDays));
            setSnack({ open: true, severity: 'warning', message: 'Request delayed' });
            setRows(rows => rows.filter(r => r._id !== delayTarget));
            setDelayOpen(false);
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to delay' });
        }
    };

    return (
        <Box p={3}>
            <Card>
                <CardHeader
                    title="Requested Books"
                    subheader="Review requests by status; act on pending ones"
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
                        <Tab label="Pending" />
                        <Tab label="Approved" />
                        <Tab label="Rejected" />
                        <Tab label="Delayed" />
                    </Tabs>
                    <Stack spacing={2}>
                        {rows.length === 0 ? (
                            <Typography color="text.secondary">{loading ? 'Loading…' : `No ${STATUS[tab]} requests.`}</Typography>
                        ) : rows.map(req => (
                            <Card key={req._id} variant="outlined">
                                <CardContent>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={1.5}>
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {req.user?.firstName} {req.user?.lastName} — {req.user?.email}
                                            </Typography>
                                            <Stack spacing={0.5} mt={1}>
                                                {req.items.map((it, idx) => (
                                                    <Typography key={idx} variant="body2">
                                                        • {it.book?.title} — {it.book?.author} (x{it.quantity})
                                                    </Typography>
                                                ))}
                                            </Stack>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Requested: {new Date(req.createdAt).toLocaleString()}
                                            </Typography>
                                            {req.status === 'delayed' && req.expectedAt && (
                                                <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                                                    Expected by: {new Date(req.expectedAt).toLocaleDateString()}
                                                </Typography>
                                            )}
                                            {req.note && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    Note: {req.note}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                                            <Chip
                                                size="small"
                                                label={req.status?.toUpperCase()}
                                                color={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'default' : req.status === 'delayed' ? 'info' : 'default'}
                                            />
                                            {tab === 0 && (
                                                <Stack direction="row" spacing={1}>
                                                    <Button onClick={() => approve(req._id)} variant="contained">Approve</Button>
                                                    <Button onClick={() => reject(req._id)} color="error" variant="outlined">Reject</Button>
                                                    <Button onClick={() => openDelay(req._id)} color="warning" variant="outlined">Delay</Button>
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

            <Dialog open={delayOpen} onClose={() => setDelayOpen(false)}>
                <DialogTitle>Delay Request</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Delay (days)"
                        type="number"
                        fullWidth
                        value={delayDays}
                        onChange={e => setDelayDays(e.target.value)}
                        inputProps={{ min: 1, max: 365 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDelayOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelay} variant="contained">Confirm Delay</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
