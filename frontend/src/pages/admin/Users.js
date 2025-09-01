import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { admin } from '../../services/api';
import {
    Box, Card, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Fade,
    Chip, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';

const ROLES = ['reader', 'librarian', 'admin'];

export default function AdminUsers() {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'reader', city: '' });
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);
    const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await admin.listUsers();
            setRows(Array.isArray(data) ? data : []);
        } catch {
            setSnack({ open: true, severity: 'error', message: 'Failed to load users' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditingId(null);
        setForm({ firstName: '', lastName: '', email: '', role: 'reader', city: '' });
        setEditOpen(true);
    };

    const openEdit = (u) => {
        setEditingId(u._id);
        setForm({
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            role: u.role || 'reader',
            city: u.city || ''
        });
        setEditOpen(true);
    };

    const save = async () => {
        try {
            if (editingId) await admin.updateUser(editingId, form);
            else await admin.createUser(form);
            setEditOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const askDelete = (u) => setConfirm({ open: true, id: u._id, name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'this user' });
    const closeConfirm = () => setConfirm({ open: false, id: null, name: '' });

    const del = async () => {
        try {
            await admin.deleteUser(confirm.id);
            setSnack({ open: true, severity: 'info', message: 'Deleted' });
            closeConfirm();
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Delete failed' });
        }
    };

    const roleColor = (r) => (r === 'admin' ? 'error' : r === 'librarian' ? 'primary' : 'default');

    // Filter users based on search term
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter((u) =>
            `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term) ||
            (u.role || '').toLowerCase().includes(term) ||
            (u.city || '').toLowerCase().includes(term)
        );
    }, [rows, searchTerm]);

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                    Users
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
                        Refresh
                    </Button>
                    <Button variant="contained" onClick={openCreate}>New User</Button>
                </Stack>
            </Stack>

            {/* Search */}
            <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search by name, email, role, or city…"
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
                    {loading ? 'Loading…' : `${filteredRows.length} user${filteredRows.length === 1 ? '' : 's'}`}
                </Typography>
            </Box>

            <Card>
                <CardContent>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small" stickyHeader aria-label="Users table"
                            sx={{
                                '& thead th': {
                                    fontWeight: 700,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.06)
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell width="24%">Name</TableCell>
                                    <TableCell width="26%">Email</TableCell>
                                    <TableCell width="14%">Role</TableCell>
                                    <TableCell width="14%">City</TableCell>
                                    <TableCell width="14%">Created</TableCell>
                                    <TableCell width="8%" align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No users found{searchTerm ? ` matching “${searchTerm}”` : ''}.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.map((u, i) => {
                                    const striped = i % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent';
                                    return (
                                        <Fade in key={u._id}>
                                            <TableRow
                                                hover
                                                sx={{
                                                    backgroundColor: striped,
                                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                                                    {(u.firstName || '') + (u.lastName ? ` ${u.lastName}` : '') || '—'}
                                                </TableCell>
                                                <TableCell sx={{ wordBreak: 'break-word' }}>{u.email || '—'}</TableCell>
                                                <TableCell>
                                                    <Chip label={(u.role || 'reader').toUpperCase()} color={roleColor(u.role)} size="small" sx={{ fontWeight: 600, letterSpacing: 0.4 }} />
                                                </TableCell>
                                                <TableCell>{u.city || '—'}</TableCell>
                                                <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</TableCell>
                                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => openEdit(u)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => askDelete(u)}>
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
                <DialogTitle>{editingId ? 'Edit User' : 'New User'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} fullWidth />
                            <TextField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} fullWidth />
                        </Stack>
                        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
                        <FormControl fullWidth>
                            <InputLabel id="role-label">Role</InputLabel>
                            <Select
                                labelId="role-label"
                                label="Role"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                            >
                                {ROLES.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={save} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={confirm.open} onClose={closeConfirm}>
                <DialogTitle>Delete User</DialogTitle>
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
