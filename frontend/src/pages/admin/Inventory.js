import React, { useEffect, useMemo, useState } from 'react';
import { admin } from '../../services/api';
import { Box, Card, CardHeader, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function AdminInventories() {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [libs, setLibs] = useState([]);
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ library: '', book: '', stock: 0, price: '' });
    const [editingId, setEditingId] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    const load = async () => {
        const [invRes, libRes, bookRes] = await Promise.all([
            admin.listInventories(),
            admin.listLibraries(),
            admin.listBooks(),
        ]);
        setRows(invRes.data);
        setLibs(libRes.data);
        setBooks(bookRes.data);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditingId(null); setForm({ library: '', book: '', stock: 0, price: '' }); setOpen(true); };
    const openEdit = (r) => { setEditingId(r._id); setForm({ library: r.library?._id || r.library, book: r.book?._id || r.book, stock: r.stock || 0, price: r.price ?? '' }); setOpen(true); };

    const save = async () => {
        try {
            const payload = { ...form, stock: Number(form.stock), price: form.price === '' ? undefined : Number(form.price) };
            if (editingId) await admin.updateInventory(editingId, payload);
            else await admin.createInventory(payload);
            setOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this inventory record?')) return;
        await admin.deleteInventory(id);
        setSnack({ open: true, severity: 'info', message: 'Deleted' });
        load();
    };

    const libById = useMemo(() => Object.fromEntries(libs.map(l => [l._id, l])), [libs]);
    const bookById = useMemo(() => Object.fromEntries(books.map(b => [b._id, b])), [books]);

    // Filter inventory based on search term
    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter(row => {
            const libraryName = (row.library?.name) || libById[row.library]?.name || '';
            const bookTitle = (row.book?.title) || bookById[row.book]?.title || '';
            const bookAuthor = (row.book?.author) || bookById[row.book]?.author || '';

            return libraryName.toLowerCase().includes(term) ||
                bookTitle.toLowerCase().includes(term) ||
                bookAuthor.toLowerCase().includes(term);
        });
    }, [rows, searchTerm, libById, bookById]);

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Inventories" action={<Button onClick={openCreate} variant="contained">New Inventory</Button>} />
                <CardContent>
                    <input
                        type="text"
                        placeholder="Search by library name, book title, or author..."
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
                        {filteredRows.map(r => (
                            <Stack key={r._id} direction="row" justifyContent="space-between" alignItems="center" sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                <Box>
                                    <strong>{(r.library?.name) || libById[r.library]?.name}</strong> — {(r.book?.title) || bookById[r.book]?.title}
                                    <div>Stock: {r.stock} {r.price != null && <>· Price: {r.price}</>}</div>
                                </Box>
                                <Box>
                                    <Tooltip title="Edit"><IconButton onClick={() => openEdit(r)}><EditIcon /></IconButton></Tooltip>
                                    <Tooltip title="Delete"><IconButton color="error" onClick={() => del(r._id)}><DeleteIcon /></IconButton></Tooltip>
                                </Box>
                            </Stack>
                        ))}
                        {filteredRows.length === 0 && searchTerm && (
                            <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                No inventory records found matching "{searchTerm}"
                            </Box>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Inventory' : 'New Inventory'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField select label="Library" value={form.library} onChange={e => setForm({ ...form, library: e.target.value })}>
                            {libs.map(l => <MenuItem key={l._id} value={l._id}>{l.name} — {l.city}</MenuItem>)}
                        </TextField>
                        <TextField select label="Book" value={form.book} onChange={e => setForm({ ...form, book: e.target.value })}>
                            {books.map(b => <MenuItem key={b._id} value={b._id}>{b.title} — {b.author}</MenuItem>)}
                        </TextField>
                        <TextField label="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                        <TextField label="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
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
