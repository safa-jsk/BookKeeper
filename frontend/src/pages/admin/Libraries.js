import React, { useEffect, useState, useMemo } from 'react';
import { admin } from '../../services/api';
import { Box, Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminLibraries() {
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', address1: '', address2: '', city: '', zip: '', owner: '' });
    const [editingId, setEditingId] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const load = async () => {
        const { data } = await admin.listLibraries();
        setRows(data);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditingId(null); setForm({ name: '', address1: '', address2: '', city: '', zip: '', owner: '' }); setOpen(true); };
    const openEdit = (l) => { setEditingId(l._id); setForm({ name: l.name || '', address1: l.address1 || '', address2: l.address2 || '', city: l.city || '', zip: l.zip || '', owner: l.owner || '' }); setOpen(true); };

    const save = async () => {
        try {
            if (editingId) await admin.updateLibrary(editingId, form);
            else await admin.createLibrary(form);
            setOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this library?')) return;
        await admin.deleteLibrary(id);
        setSnack({ open: true, severity: 'info', message: 'Deleted' });
        load();
    };

    // Filter libraries based on search term
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter(library =>
            library.name?.toLowerCase().includes(term) ||
            library.city?.toLowerCase().includes(term) ||
            library.zip?.toLowerCase().includes(term) ||
            library.address1?.toLowerCase().includes(term)
        );
    }, [rows, searchTerm]);

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Libraries" action={<Button onClick={openCreate} variant="contained">New Library</Button>} />
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Search libraries by name, city, zip, or address..."
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
                    <Stack spacing={1}>
                        {filteredRows.map(l => (
                            <Stack key={l._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                <Box>
                                    <strong>{l.name}</strong> — {l.city}, {l.zip}
                                </Box>
                                <Box>
                                    <Tooltip title="Edit"><IconButton onClick={() => openEdit(l)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton color="error" onClick={() => del(l._id)}><DeleteIcon /></IconButton></Tooltip>
                                </Box>
                            </Stack>
                        ))}
                        {filteredRows.length === 0 && searchTerm && (
                            <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                No libraries found matching "{searchTerm}"
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Library' : 'New Library'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        <TextField label="Address 1" value={form.address1} onChange={e => setForm({ ...form, address1: e.target.value })} />
                        <TextField label="Address 2" value={form.address2} onChange={e => setForm({ ...form, address2: e.target.value })} />
                        <TextField label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                        <TextField label="ZIP" value={form.zip} onChange={e => setForm({ ...form, zip: e.target.value })} />
                        <TextField label="Owner (UserId)" value={form.owner} onChange={e => setForm({ ...form, owner: e.target.value })} />
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
