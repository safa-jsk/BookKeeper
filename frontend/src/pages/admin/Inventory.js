import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { admin } from '../../services/api';
import {
    Box, Card, CardContent, Button, Stack, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, IconButton, Tooltip, Snackbar, Alert, Typography,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Fade,
    MenuItem, Collapse, Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';

export default function AdminInventories() {
    const theme = useTheme();

    // Data
    const [inventories, setInventories] = useState([]);
    const [libs, setLibs] = useState([]);
    const [books, setBooks] = useState([]);

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

    // Create/Edit form
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ library: '', book: '', stock: 0, price: '' });

    // Delete confirm
    const [confirm, setConfirm] = useState({ open: false, id: null, label: '' });

    // Row expansion map: { [bookId]: boolean }
    const [expanded, setExpanded] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [invRes, libRes, bookRes] = await Promise.all([
                admin.listInventories(),
                admin.listLibraries(),
                admin.listBooks(),
            ]);
            setInventories(Array.isArray(invRes.data) ? invRes.data : []);
            setLibs(Array.isArray(libRes.data) ? libRes.data : []);
            setBooks(Array.isArray(bookRes.data) ? bookRes.data : []);
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: 'Failed to load inventories' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Indexes
    const libById = useMemo(() => Object.fromEntries(libs.map(l => [l._id, l])), [libs]);
    const bookById = useMemo(() => Object.fromEntries(books.map(b => [b._id, b])), [books]);

    // Group inventories by bookId
    const invByBook = useMemo(() => {
        const map = {};
        for (const r of inventories) {
            const bookId = typeof r.book === 'string' ? r.book : r.book?._id;
            if (!bookId) continue;
            (map[bookId] ||= []).push(r);
        }
        return map;
    }, [inventories]);

    // Build book-centric rows with aggregates
    const bookRows = useMemo(() => {
        return books.map(b => {
            const list = invByBook[b._id] || [];
            const totalStock = list.reduce((sum, it) => sum + (Number(it.stock) || 0), 0);
            const libSet = new Set(list.map(it => (typeof it.library === 'string' ? it.library : it.library?._id)));
            return {
                book: b,
                inventories: list,
                totalStock,
                libCount: libSet.size,
            };
        });
    }, [books, invByBook]);

    // Filter (by book fields)
    const filteredBookRows = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        if (!needle) return bookRows;
        return bookRows.filter(({ book }) =>
            (book.title || '').toLowerCase().includes(needle) ||
            (book.author || '').toLowerCase().includes(needle) ||
            (book.genre || '').toLowerCase().includes(needle) ||
            String(book.year || '').includes(needle)
        );
    }, [bookRows, searchTerm]);

    const toggleExpand = (bookId) =>
        setExpanded(prev => ({ ...prev, [bookId]: !prev[bookId] }));

    // Open form
    const openCreate = () => {
        setEditingId(null);
        setForm({ library: '', book: '', stock: 0, price: '' });
        setEditOpen(true);
    };
    const openCreateForBook = (bookId) => {
        setEditingId(null);
        setForm({ library: '', book: bookId, stock: 0, price: '' });
        setEditOpen(true);
    };
    const openEdit = (rec) => {
        setEditingId(rec._id);
        setForm({
            library: rec.library?._id || rec.library || '',
            book: rec.book?._id || rec.book || '',
            stock: rec.stock ?? 0,
            price: rec.price ?? '',
        });
        setEditOpen(true);
    };

    // Persist
    const save = async () => {
        try {
            const payload = {
                ...form,
                stock: Number(form.stock),
                price: form.price === '' ? undefined : Number(form.price),
            };
            if (editingId) await admin.updateInventory(editingId, payload);
            else await admin.createInventory(payload);
            setEditOpen(false);
            setSnack({ open: true, severity: 'success', message: 'Saved' });
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Save failed' });
        }
    };

    const askDelete = (rec) => {
        const book = typeof rec.book === 'string' ? bookById[rec.book] : rec.book;
        const lib = typeof rec.library === 'string' ? libById[rec.library] : rec.library;
        const label = `${book?.title || 'Book'} — ${lib?.name || 'Library'}`;
        setConfirm({ open: true, id: rec._id, label });
    };
    const closeConfirm = () => setConfirm({ open: false, id: null, label: '' });

    const del = async () => {
        try {
            await admin.deleteInventory(confirm.id);
            setSnack({ open: true, severity: 'info', message: 'Deleted' });
            closeConfirm();
            load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Delete failed' });
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header row */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: 2 }}>
                    Inventory by Book
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
                        New Inventory
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
                    {loading ? 'Loading…' : `${filteredBookRows.length} book${filteredBookRows.length === 1 ? '' : 's'}`}
                </Typography>
            </Box>

            {/* MAIN TABLE (Books) */}
            <Card>
                <CardContent>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table size="small" stickyHeader aria-label="Inventory by Book"
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
                                    <TableCell width="30%">Title</TableCell>
                                    <TableCell width="20%">Author</TableCell>
                                    <TableCell width="14%">Genre</TableCell>
                                    <TableCell width="8%">Year</TableCell>
                                    <TableCell width="12%">Total Stock</TableCell>
                                    <TableCell width="12%">Libraries</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredBookRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No books found{searchTerm ? ` matching “${searchTerm}”` : ''}.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredBookRows.map(({ book, inventories: invList, totalStock, libCount }, i) => {
                                    const striped = i % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent';
                                    const isOpen = !!expanded[book._id];
                                    return (
                                        <React.Fragment key={book._id}>
                                            <Fade in>
                                                <TableRow
                                                    hover
                                                    sx={{
                                                        backgroundColor: striped,
                                                        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            aria-label={isOpen ? 'Collapse' : 'Expand'}
                                                            onClick={() => toggleExpand(book._id)}
                                                        >
                                                            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </IconButton>
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                                                        {book.title}
                                                    </TableCell>
                                                    <TableCell sx={{ wordBreak: 'break-word' }}>{book.author || '—'}</TableCell>
                                                    <TableCell>{book.genre || '—'}</TableCell>
                                                    <TableCell>{book.year || '—'}</TableCell>
                                                    <TableCell>
                                                        <Chip label={totalStock} size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={`${libCount}`} size="small" />
                                                    </TableCell>
                                                </TableRow>
                                            </Fade>

                                            {/* EXPANDED ROW: per-library stock */}
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                        <Box sx={{ my: 2, mx: 1 }}>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                    Stock by Library
                                                                </Typography>
                                                                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => openCreateForBook(book._id)}>
                                                                    Add stock for this book
                                                                </Button>
                                                            </Stack>
                                                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                                <Table size="small" aria-label={`Stock table for ${book.title}`}>
                                                                    <TableHead>
                                                                        <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.03) } }}>
                                                                            <TableCell width="34%">Library</TableCell>
                                                                            <TableCell width="20%">City</TableCell>
                                                                            <TableCell width="14%">Stock</TableCell>
                                                                            <TableCell width="14%">Price</TableCell>
                                                                            <TableCell width="18%" align="right">Actions</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {invList.length === 0 ? (
                                                                            <TableRow>
                                                                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                                                    No stock available across libraries for this book.
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ) : invList.map((rec) => {
                                                                            const lib = typeof rec.library === 'string' ? libById[rec.library] : rec.library;
                                                                            const libraryName = lib?.name || '—';
                                                                            const city = lib?.city || '—';
                                                                            return (
                                                                                <TableRow key={rec._id} hover>
                                                                                    <TableCell sx={{ wordBreak: 'break-word' }}>{libraryName}</TableCell>
                                                                                    <TableCell>{city}</TableCell>
                                                                                    <TableCell>{rec.stock ?? 0}</TableCell>
                                                                                    <TableCell>{rec.price != null ? rec.price : '—'}</TableCell>
                                                                                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                                                        <Tooltip title="Edit">
                                                                                            <IconButton size="small" onClick={() => openEdit(rec)}>
                                                                                                <EditIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                        <Tooltip title="Delete">
                                                                                            <IconButton size="small" color="error" onClick={() => askDelete(rec)}>
                                                                                                <DeleteIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })}
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

            {/* Create/Edit dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editingId ? 'Edit Inventory' : 'New Inventory'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} mt={1}>
                        <TextField select label="Library" value={form.library} onChange={e => setForm({ ...form, library: e.target.value })} fullWidth>
                            {libs.map(l => <MenuItem key={l._id} value={l._id}>{l.name} — {l.city}</MenuItem>)}
                        </TextField>
                        <TextField select label="Book" value={form.book} onChange={e => setForm({ ...form, book: e.target.value })} fullWidth>
                            {books.map(b => <MenuItem key={b._id} value={b._id}>{b.title} — {b.author}</MenuItem>)}
                        </TextField>
                        <TextField label="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} fullWidth />
                        <TextField label="Price" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} fullWidth />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button onClick={save} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={confirm.open} onClose={closeConfirm}>
                <DialogTitle>Delete Inventory</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2">
                        Are you sure you want to delete <strong>{confirm.label}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirm}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={del}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={2600}
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
