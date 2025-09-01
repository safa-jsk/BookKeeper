import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { admin } from '../../services/api';
import {
    Box, Card, CardContent, Tabs, Tab, Stack, IconButton, Tooltip, Typography,
    Button, Chip, Snackbar, Alert, TextField, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Fade, Dialog, DialogTitle,
    DialogContent, DialogActions, Collapse
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleIcon from '@mui/icons-material/Schedule';

const STATUS = ['pending', 'approved', 'rejected', 'delayed'];

export default function AdminRequests() {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    // expanded rows: { [requestId]: bool }
    const [expanded, setExpanded] = useState({});

    // dialogs
    const [confirm, setConfirm] = useState({ open: false, type: null, id: null, label: '', days: 3 });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await admin.listRequests(STATUS[tab]);
            setRows(Array.isArray(data) ? data : []);
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Failed to load requests' });
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    const toggleExpand = (id) => setExpanded((s) => ({ ...s, [id]: !s[id] }));

    const roleColor = (s) =>
        s === 'pending' ? 'warning' : s === 'approved' ? 'success' : s === 'rejected' ? 'default' : 'info';

    // Actions with confirms
    const openConfirm = (type, r) => {
        const label = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || r.user?.email || r._id;
        setConfirm({ open: true, type, id: r._id, label, days: 3 });
    };
    const closeConfirm = () => setConfirm({ open: false, type: null, id: null, label: '', days: 3 });

    const doAction = async () => {
        try {
            if (confirm.type === 'approve') {
                await admin.approveRequest(confirm.id);
                setSnack({ open: true, severity: 'success', message: 'Approved' });
            } else if (confirm.type === 'reject') {
                await admin.rejectRequest(confirm.id);
                setSnack({ open: true, severity: 'info', message: 'Rejected' });
            } else if (confirm.type === 'delay') {
                await admin.delayRequest(confirm.id, Number(confirm.days) || 3);
                setSnack({ open: true, severity: 'warning', message: `Delayed ${confirm.days} day(s)` });
            } else if (confirm.type === 'delete') {
                await admin.deleteRequest(confirm.id);
                setSnack({ open: true, severity: 'success', message: 'Deleted' });
            }
            closeConfirm();
            load();
        } catch (e) {
            const msg = e?.response?.data?.message || 'Action failed';
            setSnack({ open: true, severity: 'error', message: msg });
        }
    };

    // Filter requests based on search term
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter((request) => {
            const userName = `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.toLowerCase();
            const userEmail = (request.user?.email || '').toLowerCase();
            const libraryName = (request.library?.name || '').toLowerCase();
            const bookTitles =
                (request.items || []).map((item) => item.book?.title || '').join(' ').toLowerCase();
            return (
                userName.includes(term) ||
                userEmail.includes(term) ||
                libraryName.includes(term) ||
                bookTitles.includes(term)
            );
        });
    }, [rows, searchTerm]);

    // Helpers
    const itemsCount = (r) => (r.items || []).reduce((n, it) => n + (Number(it.quantity) || 0), 0);

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                    Requests
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
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Pending" />
                <Tab label="Approved" />
                <Tab label="Rejected" />
                <Tab label="Delayed" />
            </Tabs>

            {/* Search */}
            <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search by user name, email, library, or book titles…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{
                        width: { xs: '100%', sm: '80%', md: '60%' },
                        '& .MuiOutlinedInput-root': { bgcolor: 'background.default', borderRadius: 2 }
                    }}
                />
            </Stack>

            {/* Results info */}
            <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {loading ? 'Loading…' : `${filteredRows.length} request${filteredRows.length === 1 ? '' : 's'}`}
                </Typography>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small" stickyHeader aria-label="Requests table"
                            sx={{
                                '& thead th': {
                                    fontWeight: 700,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.06)
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell width="4%"></TableCell>
                                    <TableCell width="22%">User</TableCell>
                                    <TableCell width="22%">Email</TableCell>
                                    <TableCell width="18%">Library</TableCell>
                                    <TableCell width="10%">Items</TableCell>
                                    <TableCell width="14%">Requested</TableCell>
                                    <TableCell width="10%">Status</TableCell>
                                    <TableCell width="14%" align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            {loading ? 'Loading…' : searchTerm ? `No requests found matching “${searchTerm}”.` : 'No requests found.'}
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.map((r, i) => {
                                    const striped = i % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent';
                                    const isOpen = !!expanded[r._id];
                                    const name = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.trim() || '—';
                                    return (
                                        <React.Fragment key={r._id}>
                                            <Fade in>
                                                <TableRow
                                                    hover
                                                    sx={{
                                                        backgroundColor: striped,
                                                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <IconButton size="small" onClick={() => toggleExpand(r._id)} aria-label={isOpen ? 'Collapse' : 'Expand'}>
                                                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{name}</TableCell>
                                                    <TableCell sx={{ wordBreak: 'break-word' }}>{r.user?.email || '—'}</TableCell>
                                                    <TableCell sx={{ wordBreak: 'break-word' }}>{r.library?.name || '—'}</TableCell>
                                                    <TableCell>{itemsCount(r)}</TableCell>
                                                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={(r.status || '').toUpperCase()}
                                                            color={roleColor(r.status)}
                                                            sx={{ fontWeight: 600, letterSpacing: 0.4 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                        {tab === 0 && (
                                                            <>
                                                                <Tooltip title="Approve">
                                                                    <span>
                                                                        <IconButton size="small" color="success" onClick={() => openConfirm('approve', r)}>
                                                                            <CheckIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                                <Tooltip title="Reject">
                                                                    <span>
                                                                        <IconButton size="small" color="default" onClick={() => openConfirm('reject', r)}>
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                                <Tooltip title="Delay">
                                                                    <span>
                                                                        <IconButton size="small" color="warning" onClick={() => openConfirm('delay', r)}>
                                                                            <ScheduleIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                        <Tooltip title="Delete">
                                                            <span>
                                                                <IconButton size="small" color="error" onClick={() => openConfirm('delete', r)}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            </Fade>

                                            {/* Expanded: items list */}
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                        <Box sx={{ my: 2, mx: 1 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                                                Items
                                                            </Typography>
                                                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                                <Table size="small" aria-label={`Items for ${name}`}>
                                                                    <TableHead>
                                                                        <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.03) } }}>
                                                                            <TableCell width="40%">Title</TableCell>
                                                                            <TableCell width="28%">Author</TableCell>
                                                                            <TableCell width="14%">Quantity</TableCell>
                                                                            <TableCell width="18%">Notes</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {(r.items || []).length === 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                                                    No items in this request.
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ) : (r.items || []).map((it, idx) => (
                                                                            <TableRow key={idx} hover>
                                                                                <TableCell sx={{ wordBreak: 'break-word' }}>{it.book?.title || '—'}</TableCell>
                                                                                <TableCell sx={{ wordBreak: 'break-word' }}>{it.book?.author || '—'}</TableCell>
                                                                                <TableCell>{it.quantity ?? 0}</TableCell>
                                                                                <TableCell sx={{ wordBreak: 'break-word' }}>{it.note || '—'}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </TableContainer>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Confirm dialogs for actions */}
            <Dialog open={confirm.open} onClose={closeConfirm}>
                <DialogTitle sx={{ textTransform: 'capitalize' }}>
                    {confirm.type} Request
                </DialogTitle>
                <DialogContent dividers>
                    {confirm.type === 'delay' ? (
                        <Stack spacing={2} sx={{ mt: 0.5 }}>
                            <Typography variant="body2">
                                Delay request for <strong>{confirm.label}</strong>.
                            </Typography>
                            <TextField
                                label="Days"
                                type="number"
                                size="small"
                                value={confirm.days}
                                onChange={(e) => setConfirm((s) => ({ ...s, days: e.target.value }))}
                                inputProps={{ min: 1, max: 30 }}
                                sx={{ maxWidth: 180 }}
                            />
                        </Stack>
                    ) : (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Are you sure you want to <strong>{confirm.type}</strong> the request for <strong>{confirm.label}</strong>?
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancel</Button>
                    <Button
                        onClick={doAction}
                        variant="contained"
                        color={
                            confirm.type === 'approve' ? 'primary' :
                                confirm.type === 'reject' ? 'inherit' :
                                    confirm.type === 'delay' ? 'warning' :
                                        'error'
                        }
                    >
                        {confirm.type === 'delay' ? `Delay ${confirm.days}d` : confirm.type?.[0]?.toUpperCase() + confirm.type?.slice(1)}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={2600}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
