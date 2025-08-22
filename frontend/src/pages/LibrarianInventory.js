import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardHeader, CardContent, Grid, TextField, Button, Stack, Typography, IconButton, Snackbar, Alert } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { listLibraryInventory, addInventory, decreaseInventory } from '../api';

export default function LibrarianInventory({ libraryId }) {
    const [rows, setRows] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const [newBook, setNewBook] = useState({ bookId: '', title: '', author: '', genre: '', isbn: '', amount: 1, price: '' });

    const load = useCallback(async () => {
        const { data } = await listLibraryInventory(libraryId);
        setRows(data);
    }, [libraryId]);

    useEffect(() => {
        if (libraryId) load();
    }, [libraryId, load]);

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
                payload.bookId = newBook.bookId;
            } else {
                // create a catalog book inline
                if (!newBook.title || !newBook.author) {
                    setSnack({ open: true, severity: 'warning', message: 'Title & Author required' });
                    return;
                }
                payload.title = newBook.title;
                payload.author = newBook.author;
                if (newBook.genre) payload.genre = newBook.genre;
                if (newBook.isbn) payload.isbn = newBook.isbn; // optional and unique if present
            }
            await addInventory(libraryId, payload);
            setNewBook({ bookId: '', title: '', author: '', genre: '', isbn: '', amount: 1, price: '' });
            await load();
            setSnack({ open: true, severity: 'success', message: 'Stock updated' });
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to add stock' });
        }
    };

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Inventory" subheader="Manage stock for your library" />
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Add / Increase form */}
                        <Grid item xs={12} md={3}>
                            <TextField label="Existing Book ID (optional)" fullWidth value={newBook.bookId} onChange={e => setNewBook(s => ({ ...s, bookId: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField label="Title" fullWidth value={newBook.title} onChange={e => setNewBook(s => ({ ...s, title: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField label="Author" fullWidth value={newBook.author} onChange={e => setNewBook(s => ({ ...s, author: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField label="Genre" fullWidth value={newBook.genre} onChange={e => setNewBook(s => ({ ...s, genre: e.target.value }))} />
                        </Grid>
                        <Grid item xs={6} md={1}>
                            <TextField label="ISBN" fullWidth value={newBook.isbn} onChange={e => setNewBook(s => ({ ...s, isbn: e.target.value }))} />
                        </Grid>
                        <Grid item xs={3} md={1}>
                            <TextField type="number" label="Amt" value={newBook.amount} onChange={e => setNewBook(s => ({ ...s, amount: e.target.value }))} />
                        </Grid>
                        <Grid item xs={3} md={1}>
                            <TextField type="number" label="Price" value={newBook.price} onChange={e => setNewBook(s => ({ ...s, price: e.target.value }))} />
                        </Grid>
                        <Grid item xs={12} md="auto">
                            <Button variant="contained" onClick={addNewOrExisting}>Add / Increase</Button>
                        </Grid>
                    </Grid>

                    <Stack spacing={2} mt={3}>
                        {rows.map(row => (
                            <Card key={row._id} variant="outlined">
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="h6">{row.book.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.book.author} · {row.book.genre} {row.book.isbn ? `· ISBN ${row.book.isbn}` : ''}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Stock: {row.stock}{row.price ? ` • Price: ${row.price}` : ''}</Typography>
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

            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
