// In LibrarianInventory.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { Autocomplete } from '@mui/material';
import {
    Box, Grid, TextField, Button, Stack, Typography, IconButton,
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
    Card, CardContent, Fade, FormControl, InputLabel, Select, MenuItem, Pagination
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { listLibraryInventory, addInventory, decreaseInventory } from '../../services/api';
import { books as booksApi } from '../../services/api';

export default function LibrarianInventory({ libraryId }) {
    const theme = useTheme();

    const [rows, setRows] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });
    const [openDlg, setOpenDlg] = useState(false);
    const [loading, setLoading] = useState(false);

    // New: search/filter/pagination state
    const [filter, setFilter] = useState('none');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    const [newBook, setNewBook] = useState({
        bookId: '', title: '', author: '', genre: '', isbn: '',
        year: '', image: '', amount: 1, price: ''
    });
    const [allBooks, setAllBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(false);

    const load = useCallback(async () => {
        if (!libraryId) return;
        setLoading(true);
        try {
            const { data } = await listLibraryInventory(libraryId);
            setRows(Array.isArray(data) ? data : []);
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to load inventory' });
        } finally {
            setLoading(false);
        }
    }, [libraryId]);

    useEffect(() => { load(); }, [load]);

    // Fetch books only when dialog is opened
    useEffect(() => {
        if (!openDlg) return;

        let cancelled = false;
        const loadBooks = async () => {
            setBooksLoading(true);
            try {
                const { data } = await booksApi.list();
                const arr = Array.isArray(data?.books) ? data.books : Array.isArray(data) ? data : [];
                const options = arr.map(b => ({ _id: b._id, title: b.title || '(Untitled)' }));
                if (!cancelled) setAllBooks(options);
            } finally {
                if (!cancelled) setBooksLoading(false);
            }
        };

        loadBooks();
        return () => { cancelled = true; };
    }, [openDlg]);

    // Debounce search like BookList
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, filter]);

    const incStock = async (row, delta = 1) => {
        try {
            await addInventory(libraryId, { bookId: row.book._id, amount: delta, price: row.price ?? undefined });
            await load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to increase stock' });
        }
    };

    const decStock = async (row, delta = 1) => {
        try {
            await decreaseInventory(libraryId, row.book._id, delta);
            await load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to decrease stock' });
        }
    };

    const addNewOrExisting = async () => {
        try {
            const payload = {
                amount: Number(newBook.amount) || 1,
                price: newBook.price ? Number(newBook.price) : undefined
            };

            if (newBook.bookId) {
                payload.bookId = newBook.bookId.trim();
            } else {
                if (!newBook.title || !newBook.author || !newBook.genre || !newBook.year) {
                    setSnack({ open: true, severity: 'warning', message: 'Title, Author, Genre & Year are required' });
                    return;
                }
                payload.title = newBook.title.trim();
                payload.author = newBook.author.trim();
                payload.genre = newBook.genre.trim();
                payload.year = Number(newBook.year);
                if (newBook.isbn) payload.isbn = newBook.isbn.trim();
                if (newBook.image) payload.image = newBook.image.trim();
            }

            await addInventory(libraryId, payload);
            setNewBook({
                bookId: '', title: '', author: '', genre: '', isbn: '',
                year: '', image: '', amount: 1, price: ''
            });
            setOpenDlg(false);
            await load();
            setSnack({ open: true, severity: 'success', message: 'Stock updated' });
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to add stock' });
        }
    };

    // Client-side filtering (Title, Author, Genre, ISBN, Year)
    const filtered = useMemo(() => {
        if (!debouncedQuery) return rows;
        const q = debouncedQuery.toLowerCase();

        const byTitle = (r) => (r.book?.title || '').toLowerCase().includes(q);
        const byAuthor = (r) => (r.book?.author || '').toLowerCase().includes(q);
        const byGenre = (r) => (r.book?.genre || '').toLowerCase().includes(q);
        const byIsbn = (r) => (r.book?.isbn || '').toLowerCase().includes(q);
        const byYear = (r) => String(r.book?.year || '').includes(q);

        switch (filter) {
            case 'title': return rows.filter(byTitle);
            case 'author': return rows.filter(byAuthor);
            case 'genre': return rows.filter(byGenre);
            case 'isbn': return rows.filter(byIsbn);
            case 'year': return rows.filter(byYear);
            case 'none':
            default:
                return rows.filter(r => byTitle(r) || byAuthor(r) || byGenre(r) || byIsbn(r) || byYear(r));
        }
    }, [rows, debouncedQuery, filter]);

    // Pagination
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageRows = filtered.slice(startIdx, startIdx + itemsPerPage);

    const handlePageChange = (_e, value) => setCurrentPage(value);

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            {/* Header to match BookList */}
            <Typography
                variant="h4"
                sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textAlign: 'center',
                    mb: 4
                }}
            >
                Library Inventory
            </Typography>

            {/* Search & Filter Row (from BookList, adapted) */}
            <Box
                component="form"
                onSubmit={(e) => e.preventDefault()}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    mb: 3
                }}
            >
                <FormControl size="small" sx={{ minWidth: 160, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
                    <InputLabel>Filter</InputLabel>
                    <Select value={filter} label="Filter" onChange={e => setFilter(e.target.value)}>
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="title">Title</MenuItem>
                        <MenuItem value="author">Author</MenuItem>
                        <MenuItem value="genre">Genre</MenuItem>
                        <MenuItem value="isbn">ISBN</MenuItem>
                        <MenuItem value="year">Year</MenuItem>
                    </Select>
                </FormControl>

                <input
                    type="text"
                    placeholder={
                        filter === 'year' ? 'Year (e.g. 2020)' :
                            filter === 'isbn' ? 'ISBN' : 'Search...'
                    }
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
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

                {/* Add / Increase button moved here for consistency */}
                <Button
                    variant="contained"
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenDlg(true)}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    Add / Increase
                </Button>
            </Box>

            {/* Results Info */}
            {!loading && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {totalItems > 0
                            ? `Showing ${startIdx + 1} - ${Math.min(startIdx + itemsPerPage, totalItems)} of ${totalItems} items`
                            : 'No inventory items found'}
                    </Typography>
                </Box>
            )}

            {/* Grid of inventory rows */}
            <Grid container spacing={3} justifyContent="center">
                {pageRows.map((row) => (
                    <Fade in={!loading} key={row.book._id}>
                        <Grid item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Card variant="outlined" sx={{ width: '100%' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>{row.book.title}</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                                {row.book.author} · {row.book.genre}
                                                {row.book.isbn ? ` · ISBN ${row.book.isbn}` : ''} · {row.book.year}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                Stock: {row.stock}
                                                {row.price != null ? ` • Price: ${row.price}` : ''}
                                                {row.totalStock != null ? ` • Total Stock: ${row.totalStock}` : ''}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                            <IconButton onClick={() => decStock(row, 1)} color="error" aria-label="Decrease stock">
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                            <IconButton onClick={() => incStock(row, 1)} color="primary" aria-label="Increase stock">
                                                <AddCircleOutlineIcon />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Fade>
                ))}
            </Grid>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {/* Add / Increase Dialog (unchanged structure) */}
            <Dialog open={openDlg} onClose={() => setOpenDlg(false)} fullWidth maxWidth="md">
                <DialogTitle>Add or Increase Stock</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                To add to an existing catalog entry, choose it below. To create a new book,
                                leave it empty and fill the required fields.
                            </Typography>
                        </Grid>

                        {/* Existing Book dropdown */}
                        <Grid item xs={12}>
                            <Autocomplete
                                options={allBooks}
                                loading={booksLoading}
                                getOptionLabel={(opt) => opt?.title || ''}
                                isOptionEqualToValue={(opt, val) => opt?._id === val?._id}
                                value={allBooks.find(o => o._id === newBook.bookId) || null}
                                onChange={(_e, value) => setNewBook(s => ({ ...s, bookId: value ? value._id : '' }))}
                                clearOnEscape
                                disablePortal
                                noOptionsText="No books found"
                                minWidth={600}
                                sx={{
                                    minWidth: { sm: 220, xs: '100%' },
                                    maxWidth: { sm: 220, xs: '100%' },
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Existing Book (optional)"
                                        placeholder="Search by title…"
                                        fullWidth
                                        sx={{
                                            minWidth: { sm: 180, xs: '100%' },
                                            maxWidth: { sm: 180, xs: '100%' },
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        {/* The rest of the fields are disabled if an existing book is selected */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Title *"
                                fullWidth
                                value={newBook.title}
                                onChange={e => setNewBook(s => ({ ...s, title: e.target.value }))}
                                disabled={Boolean(newBook.bookId)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Author *"
                                fullWidth
                                value={newBook.author}
                                onChange={e => setNewBook(s => ({ ...s, author: e.target.value }))}
                                disabled={Boolean(newBook.bookId)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Genre *"
                                fullWidth
                                value={newBook.genre}
                                onChange={e => setNewBook(s => ({ ...s, genre: e.target.value }))}
                                disabled={Boolean(newBook.bookId)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Year *"
                                type="number"
                                fullWidth
                                value={newBook.year}
                                onChange={e => setNewBook(s => ({ ...s, year: e.target.value }))}
                                disabled={Boolean(newBook.bookId)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="ISBN"
                                fullWidth
                                value={newBook.isbn}
                                onChange={e => setNewBook(s => ({ ...s, isbn: e.target.value }))}
                                disabled={Boolean(newBook.bookId)}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Image URL"
                                fullWidth
                                value={newBook.image}
                                onChange={e => setNewBook(s => ({ ...s, image: e.target.value }))}
                                disabled={Boolean(newBook.bookId)}
                            />
                        </Grid>

                        <Grid item xs={6} md={2}>
                            <TextField
                                label="Amount"
                                type="number"
                                fullWidth
                                value={newBook.amount}
                                onChange={e => setNewBook(s => ({ ...s, amount: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                label="Price"
                                type="number"
                                fullWidth
                                value={newBook.price}
                                onChange={e => setNewBook(s => ({ ...s, price: e.target.value }))}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDlg(false)}>Cancel</Button>
                    <Button variant="contained" onClick={addNewOrExisting}>Save</Button>
                </DialogActions>
            </Dialog>


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
