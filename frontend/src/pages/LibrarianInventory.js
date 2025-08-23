// In LibrarianInventory.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Card, CardHeader, CardContent, Grid, TextField, Button, Stack, Typography,
    IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { listLibraryInventory, addInventory, decreaseInventory } from '../api';

export default function LibrarianInventory({ libraryId }) {
    const [rows, setRows] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    // dialog state
    const [openDlg, setOpenDlg] = useState(false);

    const [newBook, setNewBook] = useState({
        bookId: '', title: '', author: '', genre: '', isbn: '',
        year: '', image: '', amount: 1, price: ''
    });

    const load = useCallback(async () => {
        const { data } = await listLibraryInventory(libraryId);
        setRows(data);
    }, [libraryId]);

    useEffect(() => { if (libraryId) load(); }, [libraryId, load]);

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

    return (
        <Box p={3}>
            <Card>
                <CardHeader
                    title="Inventory"
                    subheader="Manage stock for your library"
                    action={<Button variant="contained" onClick={() => setOpenDlg(true)}>Add / Increase</Button>}
                />
                <CardContent>
                    <Stack spacing={2}>
                        {rows.map(row => (
                            <Card key={`${row.book._id}`} variant="outlined">
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6">{row.book.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.book.author} · {row.book.genre}
                                                {row.book.isbn ? ` · ISBN ${row.book.isbn}` : ''} · {row.book.year}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Stock: {row.stock}
                                                {typeof row.price !== 'undefined' ? ` • Price: ${row.price}` : ''}
                                                {` • Total Stock (all libraries): ${row.totalStock}`}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Stock: {row.stock}
                                                {row.price != null ? ` • Price: ${row.price}` : ''}
                                                {row.totalStock != null ? ` • Total Stock: ${row.totalStock}` : ''}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1}>
                                            <IconButton onClick={() => decStock(row, 1)} color="error"><RemoveCircleOutlineIcon /></IconButton>
                                            <IconButton onClick={() => incStock(row, 1)} color="primary"><AddCircleOutlineIcon /></IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Add / Increase Dialog */}
            <Dialog open={openDlg} onClose={() => setOpenDlg(false)} fullWidth maxWidth="md">
                <DialogTitle>Add or Increase Stock</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} mt={0.5}>
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                                To add to an existing catalog entry, fill <b>Existing Book ID</b> only.
                                To create a new catalog book, leave Book ID empty and fill the required fields.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField label="Existing Book ID (optional)" fullWidth
                                value={newBook.bookId}
                                onChange={e => setNewBook(s => ({ ...s, bookId: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField label="Title *" fullWidth
                                value={newBook.title}
                                onChange={e => setNewBook(s => ({ ...s, title: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField label="Author *" fullWidth
                                value={newBook.author}
                                onChange={e => setNewBook(s => ({ ...s, author: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField label="Genre *" fullWidth
                                value={newBook.genre}
                                onChange={e => setNewBook(s => ({ ...s, genre: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField label="Year *" type="number" fullWidth
                                value={newBook.year}
                                onChange={e => setNewBook(s => ({ ...s, year: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField label="ISBN" fullWidth
                                value={newBook.isbn}
                                onChange={e => setNewBook(s => ({ ...s, isbn: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField label="Image URL" fullWidth
                                value={newBook.image}
                                onChange={e => setNewBook(s => ({ ...s, image: e.target.value }))} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField label="Amount" type="number" fullWidth
                                value={newBook.amount}
                                onChange={e => setNewBook(s => ({ ...s, amount: e.target.value }))} />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField label="Price" type="number" fullWidth
                                value={newBook.price}
                                onChange={e => setNewBook(s => ({ ...s, price: e.target.value }))} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDlg(false)}>Cancel</Button>
                    <Button variant="contained" onClick={addNewOrExisting}>Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
