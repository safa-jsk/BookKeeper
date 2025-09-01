import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { admin } from '../../services/api';
import {
    Box, Card, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Fade
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function AdminLibraries() {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', address1: '', address2: '', city: '', zip: '', owner: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    // id -> "First Last"
    const [ownerNameMap, setOwnerNameMap] = useState({});
    const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await admin.listLibraries();
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: 'Failed to load libraries' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Fetch owner names for any owner IDs we haven't resolved yet
    useEffect(() => {
        const missingIds = new Set();
        for (const l of rows) {
            // If backend already populated owner object, no fetch needed
            if (l?.owner && typeof l.owner === 'object' && (l.owner.firstName || l.owner.lastName)) continue;
            const ownerId = typeof l.owner === 'string' ? l.owner : null;
            if (ownerId && !ownerNameMap[ownerId]) missingIds.add(ownerId);
        }
        if (missingIds.size === 0) return;

        (async () => {
            try {
                const entries = await Promise.all(
                    Array.from(missingIds).map(async (id) => {
                        try {
                            // Expecting admin.getUser(id) -> { data: { firstName, lastName, _id } }
                            const { data } = await admin.getUser(id);
                            const full = [data?.firstName, data?.lastName].filter(Boolean).join(' ').trim() || id;
                            return [id, full];
                        } catch {
                            return [id, id]; // fallback to id if fetch fails
                        }
                    })
                );
                setOwnerNameMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
            } catch {
                // ignore batch-level errors; per-ID fallback above handles display
            }
        })();
    }, [rows, ownerNameMap]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ name: '', address1: '', address2: '', city: '', zip: '', owner: '' });
        setEditOpen(true);
    };

    const openEdit = (l) => {
        setEditingId(l._id);
        setForm({
            name: l.name || '',
            address1: l.address1 || '',
            address2: l.address2 || '',
            city: l.city || '',
            zip: l.zip || '',
            owner: typeof l.owner === 'string' ? l.owner : (l.owner?._id || '')
        });
        setEditOpen(true);
    };

    const save = async () => {
        try {
            if (editingId) await admin.updateLibrary(editingId, form);
            else await admin.createLibrary(form);
            setEditOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const askDelete = (l) => setConfirm({ open: true, id: l._id, name: l.name || 'this library' });
    const closeConfirm = () => setConfirm({ open: false, id: null, name: '' });

    const del = async () => {
        try {
            await admin.deleteLibrary(confirm.id);
            setSnack({ open: true, severity: 'info', message: 'Deleted' });
            closeConfirm();
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Delete failed' });
        }
    };

    // Filter libraries based on search term (now includes owner full name)
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter((library) => {
            const ownerFull =
                (typeof library.owner === 'object'
                    ? [library.owner?.firstName, library.owner?.lastName].filter(Boolean).join(' ')
                    : ownerNameMap[library.owner] || ''
                ).toLowerCase();

            return (
                (library.name || '').toLowerCase().includes(term) ||
                (library.city || '').toLowerCase().includes(term) ||
                (library.zip || '').toLowerCase().includes(term) ||
                (library.address1 || '').toLowerCase().includes(term) ||
                (library.address2 || '').toLowerCase().includes(term) ||
                ownerFull.includes(term)
            );
        });
    }, [rows, searchTerm, ownerNameMap]);

    // Helper: resolve owner display name
    const renderOwnerName = (owner) => {
        if (!owner) return '—';
        if (typeof owner === 'object') {
            const full = [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim();
            return full || owner._id || '—';
        }
        return ownerNameMap[owner] || '—';
    };

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                    Libraries
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
                        Refresh
                    </Button>
                    <Button variant="contained" onClick={openCreate}>
                        New Library
                    </Button>
                </Stack>
            </Stack>

            {/* Search */}
            <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search by name, address, city, ZIP, or owner…"
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
                    {loading ? 'Loading…' : `${filteredRows.length} librar${filteredRows.length === 1 ? 'y' : 'ies'}`}
                </Typography>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small" stickyHeader aria-label="Libraries table"
                            sx={{
                                '& thead th': {
                                    fontWeight: 700,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.06)
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell width="22%">Name</TableCell>
                                    <TableCell width="34%">Address</TableCell>
                                    <TableCell width="14%">City</TableCell>
                                    <TableCell width="10%">ZIP</TableCell>
                                    <TableCell width="12%">Owner</TableCell>
                                    <TableCell width="8%">Created</TableCell>
                                    <TableCell width="8%" align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No libraries found{searchTerm ? ` matching “${searchTerm}”` : ''}.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.map((l, i) => {
                                    const striped = i % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent';
                                    return (
                                        <Fade in key={l._id}>
                                            <TableRow
                                                hover
                                                sx={{
                                                    backgroundColor: striped,
                                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                                                    {l.name}
                                                </TableCell>
                                                <TableCell sx={{ wordBreak: 'break-word' }}>
                                                    {l.address1}{l.address2 ? `, ${l.address2}` : ''}{(l.city || l.zip) ? ',' : ''} {l.city} {l.zip}
                                                </TableCell>
                                                <TableCell>{l.city || '—'}</TableCell>
                                                <TableCell>{l.zip || '—'}</TableCell>
                                                <TableCell sx={{ wordBreak: 'break-word' }}>
                                                    {renderOwnerName(l.owner)}
                                                </TableCell>
                                                <TableCell>
                                                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}
                                                </TableCell>
                                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => openEdit(l)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => askDelete(l)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        </Fade>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create/Edit dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Library' : 'New Library'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth />
                        <TextField label="Address 1" value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} fullWidth />
                        <TextField label="Address 2" value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} fullWidth />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} fullWidth />
                            <TextField label="ZIP" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} fullWidth />
                        </Stack>
                        <TextField label="Owner (UserId)" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={save} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={confirm.open} onClose={closeConfirm}>
                <DialogTitle>Delete Library</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2">
                        Are you sure you want to delete <strong>{confirm.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={del}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snack.open}
                autoHideDuration={2400}
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
