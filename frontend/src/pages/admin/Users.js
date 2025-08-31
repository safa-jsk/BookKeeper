import React, { useEffect, useState, useMemo } from 'react';
import { admin } from '../../services/api';
import { Box, Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function AdminUsers() {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'reader', city: '' });
    const [editingId, setEditingId] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const load = async () => {
        const { data } = await admin.listUsers();
        setRows(data);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditingId(null); setForm({ firstName: '', lastName: '', email: '', role: 'reader', city: '' }); setOpen(true); };
    const openEdit = (u) => { setEditingId(u._id); setForm({ firstName: u.firstName || '', lastName: u.lastName || '', email: u.email || '', role: u.role || 'reader', city: u.city || '' }); setOpen(true); };

    const save = async () => {
        try {
            if (editingId) await admin.updateUser(editingId, form);
            else await admin.createUser(form);
            setOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        await admin.deleteUser(id);
        setSnack({ open: true, severity: 'info', message: 'Deleted' });
        load();
    };

    // Filter users based on search term
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter(user =>
            user.firstName?.toLowerCase().includes(term) ||
            user.lastName?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term) ||
            user.role?.toLowerCase().includes(term) ||
            user.city?.toLowerCase().includes(term)
        );
    }, [rows, searchTerm]);

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Users" action={<Button onClick={openCreate} variant="contained">New User</Button>} />
                <CardContent>
                    <input
                        type="text"
                        placeholder="Search users by name, email, role, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '10px',
                            width: '60%',
                            borderRadius: '8px',
                            border: `1.5px solid ${theme.palette.info.main}`,
                            background: theme.palette.background.default,
                            color: theme.palette.primary.main,
                            fontSize: 16,
                            outline: 'none'
                        }}
                    />
                    <Stack spacing={1}>
                        {filteredRows.map(u => (
                            <Stack key={u._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                <Box>
                                    <strong>{u.firstName} {u.lastName}</strong> — {u.email} ({u.role})
                                </Box>
                                <Box>
                                    <Tooltip title="Edit"><IconButton onClick={() => openEdit(u)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton color="error" onClick={() => del(u._id)}><DeleteIcon /></IconButton></Tooltip>
                                </Box>
                            </Stack>
                        ))}
                        {filteredRows.length === 0 && searchTerm && (
                            <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                No users found matching "{searchTerm}"
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit User' : 'New User'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                        <TextField label="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                        <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        <TextField label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                        <TextField label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={save} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2400} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
