import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Box, Card, CardHeader, CardContent, Tabs, Tab, Stack, IconButton, Tooltip, Typography, Button, Chip, Snackbar, Alert, TextField, InputAdornment } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import { admin } from '../../services/api';

const STATUS = ['pending', 'approved', 'rejected', 'delayed'];

export default function AdminRequests() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await admin.listRequests(STATUS[tab]);
            setRows(data || []);
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Failed to load requests' });
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    const approve = async (id) => {
        try { await admin.approveRequest(id); setSnack({ open: true, severity: 'success', message: 'Approved' }); load(); }
        catch (e) { setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Approve failed' }); }
    };
    const reject = async (id) => {
        try { await admin.rejectRequest(id); setSnack({ open: true, severity: 'info', message: 'Rejected' }); load(); }
        catch (e) { setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Reject failed' }); }
    };
    const delay = async (id) => {
        const days = 3;
        try { await admin.delayRequest(id, days); setSnack({ open: true, severity: 'warning', message: `Delayed ${days} days` }); load(); }
        catch (e) { setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Delay failed' }); }
    };
    const remove = async (id) => {
        try { await admin.deleteRequest(id); setSnack({ open: true, severity: 'success', message: 'Deleted' }); load(); }
        catch { setSnack({ open: true, severity: 'error', message: 'Delete failed' }); }
    };

    // Filter requests based on search term
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter(request => {
            const userName = `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.toLowerCase();
            const userEmail = (request.user?.email || '').toLowerCase();
            const libraryName = (request.library?.name || '').toLowerCase();
            const bookTitles = request.items?.map(item => item.book?.title || '').join(' ').toLowerCase() || '';

            return userName.includes(term) ||
                userEmail.includes(term) ||
                libraryName.includes(term) ||
                bookTitles.includes(term);
        });
    }, [rows, searchTerm]);

    return (
        <Box p={3}>
            <Card>
                <CardHeader
                    title="Requests"
                    subheader="Manage all user requests across libraries"
                    action={
                        <Tooltip title="Refresh">
                            <span><IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton></span>
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

                    <TextField
                        fullWidth
                        placeholder="Search by user name, email, library, or book titles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Stack spacing={2}>
                        {filteredRows.length === 0 ? (
                            <Typography color="text.secondary">
                                {loading ? 'Loading…' : searchTerm ? `No requests found matching "${searchTerm}"` : 'No requests found.'}
                            </Typography>
                        ) : filteredRows.map(r => (
                            <Card key={r._id} variant="outlined">
                                <CardContent>
                                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.5}>
                                        <Box>
                                            <Typography variant="subtitle1">{r.user?.firstName} {r.user?.lastName} — {r.user?.email}</Typography>
                                            <Typography variant="body2" color="text.secondary">Library: {r.library?.name}</Typography>
                                            <Stack spacing={0.5} mt={1}>
                                                {r.items.map((it, idx) => (
                                                    <Typography key={idx} variant="body2">• {it.book?.title} — {it.book?.author} (x{it.quantity})</Typography>
                                                ))}
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary">Requested: {new Date(r.createdAt).toLocaleString()}</Typography>
                                        </Box>
                                        <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={1}>
                                            <Chip size="small" label={r.status?.toUpperCase()} color={r.status === 'pending' ? 'warning' : r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'default' : 'info'} />
                                            {tab === 0 && (
                                                <Stack direction="row" spacing={1}>
                                                    <Button onClick={() => approve(r._id)} variant="contained">Approve</Button>
                                                    <Button onClick={() => reject(r._id)} variant="outlined" color="error">Reject</Button>
                                                    <Button onClick={() => delay(r._id)} variant="outlined" color="warning">Delay</Button>
                                                </Stack>
                                            )}
                                            <Button onClick={() => remove(r._id)} variant="text" color="error">Delete</Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}


