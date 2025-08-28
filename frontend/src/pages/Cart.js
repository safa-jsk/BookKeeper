import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, Stack, IconButton, Button, TextField, Divider, Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert, Collapse } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { getCart, addCartItem, removeCartItem, createRequest } from '../services/api';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [availability, setAvailability] = useState({});
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [chosenLibrary, setChosenLibrary] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [openLibraries, setOpenLibraries] = useState({});

    const load = async () => {
        const { data } = await getCart();
        setCart(data.cart);
        setAvailability(data.availability || {});
    };

    useEffect(() => { load(); }, []);

    const updateQty = async (bookId, quantity) => {
        await addCartItem(bookId, quantity);
        await load();
    };

    const removeItem = async (bookId) => {
        await removeCartItem(bookId);
        await load();
    };

    const libraryOptions = useMemo(() => {
        // Build a union of libraries that can fulfill ALL items (simple strategy: let user pick any; librarian may later reject if stock insufficient)
        const map = {};
        Object.values(availability).forEach(list => {
            list.forEach(lib => { map[lib.libraryId] = lib; });
        });
        return Object.values(map);
    }, [availability]);

    const onCheckout = () => {
        setChosenLibrary('');
        setCheckoutOpen(true);
    };

    const confirmRequest = async () => {
        if (!chosenLibrary) return;
        setSubmitting(true);
        try {
            // Build items [{bookId, quantity}]
            const items = (cart?.items || []).map(it => ({ bookId: it.book._id || it.book, quantity: it.quantity }));
            await createRequest(chosenLibrary, items);
            setSnack({ open: true, severity: 'success', message: 'Request sent to library. You’ll be notified after approval.' });
            setCheckoutOpen(false);
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to place request.';
            setSnack({ open: true, severity: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    if (!cart) return null;

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Your Cart" />
                <CardContent>
                    {cart.items.length === 0 ? (
                        <Typography color="text.secondary">Your cart is empty.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {cart.items.map((it) => {
                                const b = it.book;
                                const libs = availability[b._id] || [];
                                return (
                                    <Card key={b._id} variant="outlined">
                                        <CardContent>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
                                                <Box>
                                                    <Typography variant="h6">{b.title}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{b.author} · {b.genre}</Typography>
                                                    <Button size="small" onClick={() => setOpenLibraries(s => ({ ...s, [b._id]: !s[b._id] }))} sx={{ mt: 1 }}>
                                                        {openLibraries[b._id] ? 'Hide Libraries' : 'Show Libraries'}
                                                    </Button>
                                                    <Collapse in={!!openLibraries[b._id]}>
                                                        <Stack spacing={1} mt={1}>
                                                            {libs.length === 0 ? (
                                                                <Typography color="text.secondary">Not available in any library</Typography>
                                                            ) : libs.map(lib => (
                                                                <Stack key={lib.libraryId} direction="row" alignItems="center" justifyContent="space-between" sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight={600}>{lib.libraryName}</Typography>
                                                                        <Typography variant="caption" color="text.secondary">{lib.address}</Typography>
                                                                    </Box>
                                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                                        <Chip size="small" label={`Stock: ${lib.stock}`} />
                                                                        <Button size="small" variant="outlined" onClick={() => {
                                                                            setChosenLibrary(lib.libraryId);
                                                                            setCheckoutOpen(true);
                                                                        }}>Request Book</Button>
                                                                    </Stack>
                                                                </Stack>
                                                            ))}
                                                        </Stack>
                                                    </Collapse>
                                                </Box>

                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        label="Qty"
                                                        value={it.quantity}
                                                        onChange={e => updateQty(b._id, Math.max(1, Number(e.target.value) || 1))}
                                                        inputProps={{ min: 1, style: { width: 64 } }}
                                                    />
                                                    <IconButton color="error" onClick={() => removeItem(b._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            <Divider />
                            <Stack direction="row" justifyContent="flex-end">
                                <Button
                                    onClick={onCheckout}
                                    variant="contained"
                                    startIcon={<ShoppingCartCheckoutIcon />}
                                    disabled={cart.items.length === 0}
                                >
                                    Request from a Library
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </CardContent>
            </Card>

            <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Select a Library</DialogTitle>
                <DialogContent dividers>
                    {libraryOptions.length === 0 ? (
                        <Typography color="text.secondary">No library currently has your cart items.</Typography>
                    ) : (
                        <TextField
                            select
                            label="Library"
                            fullWidth
                            value={chosenLibrary}
                            onChange={e => setChosenLibrary(e.target.value)}
                            helperText="Address shown in the option text"
                        >
                            {libraryOptions.map(lib => (
                                <MenuItem key={lib.libraryId} value={lib.libraryId}>
                                    {lib.libraryName} — {lib.address}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                    <Button onClick={confirmRequest} disabled={!chosenLibrary || submitting} variant="contained">
                        {submitting ? 'Sending…' : 'Send Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
            </Snackbar>
        </Box>
    );
}
