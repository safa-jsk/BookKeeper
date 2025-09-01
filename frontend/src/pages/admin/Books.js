import React, { useEffect, useState, useMemo } from 'react';
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

export default function AdminBooks() {
    const theme = useTheme();
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ title: '', author: '', genre: '', year: '', image: '' });
    const [editingId, setEditingId] = useState(null);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await admin.listBooks();
            setRows(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditingId(null);
        setForm({ title: '', author: '', genre: '', year: '', image: '' });
        setOpen(true);
    };

    const openEdit = (b) => {
        setEditingId(b._id);
        setForm({ title: b.title || '', author: b.author || '', genre: b.genre || '', year: b.year || '', image: b.image || '' });
        setOpen(true);
    };

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

    const filteredRows = useMemo(() => {
        if (!searchTerm.trim()) return rows;
        const term = searchTerm.toLowerCase();
        return rows.filter(book =>
            book.title?.toLowerCase().includes(term) ||
            book.author?.toLowerCase().includes(term) ||
            book.genre?.toLowerCase().includes(term) ||
            String(book.year || '').includes(term)
        );
    }, [rows, searchTerm]);

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header row like Librarian Applications */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography
                    variant="h4"
                    sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}
                >
                    Books
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={load}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button variant="contained" onClick={openCreate}>
                        New Book
                    </Button>
                </Stack>
            </Stack>

            {/* Search */}
            <Stack direction="row" justifyContent="center" sx={{ mb: 2 }}>
                <TextField
                    placeholder="Search books by title, author, genre, or year…"
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
                    {filteredRows.length} book{filteredRows.length === 1 ? '' : 's'}
                </Typography>
            </Box>

            <Card>
                <CardContent>
                    {/* Striped table */}
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small" stickyHeader aria-label="Books table"
                            sx={{
                                '& thead th': {
                                    fontWeight: 700,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.06)
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell width="32%">Title</TableCell>
                                    <TableCell width="22%">Author</TableCell>
                                    <TableCell width="14%">Genre</TableCell>
                                    <TableCell width="10%">Year</TableCell>
                                    <TableCell width="14%">Image</TableCell>
                                    <TableCell width="8%" align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No books found{searchTerm ? ` matching “${searchTerm}”` : ''}.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRows.map((b, i) => {
                                    const striped = i % 2 === 0
                                        ? alpha(theme.palette.primary.main, 0.03)
                                        : 'transparent';
                                    return (
                                        <Fade in key={b._id}>
                                            <TableRow
                                                hover
                                                sx={{
                                                    backgroundColor: striped,
                                                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{b.title}</TableCell>
                                                <TableCell sx={{ wordBreak: 'break-word' }}>{b.author}</TableCell>
                                                <TableCell>{b.genre}</TableCell>
                                                <TableCell>{b.year}</TableCell>
                                                <TableCell>
                                                    {b.image ? (
                                                        <img
                                                            src={b.image}
                                                            alt={b.title}
                                                            style={{ width: 44, height: 60, objectFit: 'cover', borderRadius: 4, border: `1px solid ${alpha('#000', 0.06)}` }}
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    ) : <Typography variant="caption" color="text.secondary">—</Typography>}
                                                </TableCell>
                                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => openEdit(b)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => del(b._id)}>
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
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Book' : 'New Book'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} fullWidth />
                        <TextField label="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} fullWidth />
                        <TextField label="Genre" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} fullWidth />
                        <TextField label="Year" type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} fullWidth />
                        <TextField label="Image URL / Path" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={save} variant="contained">Save</Button>
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
