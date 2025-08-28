import React, { useEffect, useState } from 'react';
import { admin } from '../../services/api';
import { Box, Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function AdminBooks() {
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ title: '', author: '', genre: '', year: '', image: '' });
    const [editingId, setEditingId] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const load = async () => {
        const { data } = await admin.listBooks();
        setRows(data);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditingId(null); setForm({ title: '', author: '', genre: '', year: '', image: '' }); setOpen(true); };
    const openEdit = (b) => { setEditingId(b._id); setForm({ title: b.title || '', author: b.author || '', genre: b.genre || '', year: b.year || '', image: b.image || '' }); setOpen(true); };

    const save = async () => {
        try {
            if (editingId) await admin.updateBook(editingId, form);
            else await admin.createBook(form);
            setOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        await admin.deleteBook(id);
        setSnack({ open: true, severity: 'info', message: 'Deleted' });
        load();
    };

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Books" action={<Button onClick={openCreate} variant="contained">New Book</Button>} />
                <CardContent>
                    <Stack spacing={1}>
                        {rows.map(b => (
                            <Stack key={b._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                <Box>
                                    <strong>{b.title}</strong> — {b.author} ({b.genre})
                                </Box>
                                <Box>
                                    <Tooltip title="Edit"><IconButton onClick={() => openEdit(b)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton color="error" onClick={() => del(b._id)}><DeleteIcon /></IconButton></Tooltip>
                                </Box>
                            </Stack>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Book' : 'New Book'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        <TextField label="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                        <TextField label="Genre" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
                        <TextField label="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                        <TextField label="Image Path" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
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
