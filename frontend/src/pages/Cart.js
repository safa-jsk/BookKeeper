import React, { useEffect, useMemo, useState } from 'react';
import {
    Box, Card, CardContent, CardHeader, Typography, Stack, IconButton, Button, TextField,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert,
    Collapse, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
    getCart, addCartItem, removeCartItem, createRequest
} from '../services/api';

export default function Cart() {
    const theme = useTheme();

    const [cart, setCart] = useState(null);
    const [availability, setAvailability] = useState({});
    const [loading, setLoading] = useState(false);
    const [qtyBusy, setQtyBusy] = useState({}); // bookId -> boolean

    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    // expand per-book libraries table
    const [openLibraries, setOpenLibraries] = useState({}); // bookId -> bool

    // checkout dialog
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [chosenLibrary, setChosenLibrary] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await getCart();
            setCart(data.cart);
            setAvailability(data.availability || {});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const updateQty = async (bookId, quantity) => {
        const q = Math.max(1, Number(quantity) || 1);
        setQtyBusy(s => ({ ...s, [bookId]: true }));
        try {
            await addCartItem(bookId, q);
            await load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: 'Failed to update quantity.' });
        } finally {
            setQtyBusy(s => ({ ...s, [bookId]: false }));
        }
    };

    const removeItem = async (bookId) => {
        try {
            await removeCartItem(bookId);
            await load();
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: 'Failed to remove item.' });
        }
    };

    // Build union of libraries present anywhere
    const allLibraryOptions = useMemo(() => {
        const map = {};
        Object.values(availability).forEach(list => {
            (list || []).forEach(lib => { map[lib.libraryId] = lib; });
        });
        // sort by name
        return Object.values(map).sort((a, b) => (a.libraryName || '').localeCompare(b.libraryName || ''));
    }, [availability]);

    // Libraries that can fulfill the WHOLE cart (stock >= desired qty for each item)
    const eligibleLibraryOptions = useMemo(() => {
        const byLib = {};
        (cart?.items || []).forEach(it => {
            const libs = availability[it.book._id] || [];
            libs.forEach(lib => {
                const ok = (Number(lib.stock) || 0) >= (Number(it.quantity) || 0);
                if (ok) {
                    byLib[lib.libraryId] = byLib[lib.libraryId] || 0;
                    byLib[lib.libraryId] += 1;
                }
            });
        });
        const totalItems = (cart?.items || []).length;
        const eligible = allLibraryOptions.filter(lib => (byLib[lib.libraryId] || 0) === totalItems);
        // Prefer libraries with higher total stock across the items (tie-breaker)
        const score = (lib) => (cart?.items || []).reduce((s, it) => {
            const rec = (availability[it.book._id] || []).find(x => x.libraryId === lib.libraryId);
            return s + (rec ? Number(rec.stock) || 0 : 0);
        }, 0);
        return eligible.sort((a, b) => score(b) - score(a));
    }, [cart, availability, allLibraryOptions]);

    // Validate a library against the full cart
    const canFulfillAll = (libraryId) => {
        return (cart?.items || []).every(it => {
            const rec = (availability[it.book._id] || []).find(l => l.libraryId === libraryId);
            return rec && (Number(rec.stock) || 0) >= (Number(it.quantity) || 0);
        });
    };

    const onCheckout = () => {
        setChosenLibrary('');
        setCheckoutOpen(true);
    };

    const confirmRequest = async () => {
        if (!chosenLibrary) return;
        // Pre-check fulfillment
        if (!canFulfillAll(chosenLibrary)) {
            const insufficient = (cart?.items || []).filter(it => {
                const rec = (availability[it.book._id] || []).find(l => l.libraryId === chosenLibrary);
                return !rec || (Number(rec.stock) || 0) < (Number(it.quantity) || 0);
            }).map(it => it.book.title);
            setSnack({
                open: true,
                severity: 'error',
                message: `Selected library cannot fulfill: ${insufficient.join(', ')}`
            });
            return;
        }

        setSubmitting(true);
        try {
            const items = (cart?.items || []).map(it => ({ bookId: it.book._id || it.book, quantity: it.quantity }));
            await createRequest(chosenLibrary, items);
            setSnack({ open: true, severity: 'success', message: 'Request sent. You’ll be notified after approval.' });
            setCheckoutOpen(false);
            // optional: reload to clear cart server-side if your API does that
            await load();
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to place request.';
            setSnack({ open: true, severity: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    // Render helpers
    const availabilityFor = (bookId) => (availability[bookId] || []).slice().sort((a, b) => (b.stock || 0) - (a.stock || 0));
    const libraryCountFor = (bookId) => (availability[bookId] || []).length;
    const bestStockFor = (bookId) => Math.max(0, ...availabilityFor(bookId).map(l => Number(l.stock) || 0));

    if (!cart) return null;

    const items = cart.items || [];

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            <Card>
                <CardHeader
                    title="Your Cart"
                    subheader={loading ? 'Loading…' : `${items.length} item${items.length === 1 ? '' : 's'}`}
                    action={
                        <Tooltip title="Refresh">
                            <span>
                                <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
                                    Refresh
                                </Button>
                            </span>
                        </Tooltip>
                    }
                />
                <CardContent>
                    {items.length === 0 ? (
                        <Typography color="text.secondary">Your cart is empty.</Typography>
                    ) : (
                        <React.Fragment>
                            {/* CART TABLE */}
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                                <Table size="small" stickyHeader aria-label="Cart table"
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
                                            <TableCell width="36%">Book</TableCell>
                                            <TableCell width="16%">Author</TableCell>
                                            <TableCell width="12%">Genre</TableCell>
                                            <TableCell width="12%">Quantity</TableCell>
                                            <TableCell width="12%">Availability</TableCell>
                                            <TableCell width="8%" align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {items.map((it, idx) => {
                                            const b = it.book;
                                            const isOpen = !!openLibraries[b._id];
                                            const libs = availabilityFor(b._id);
                                            const libCount = libraryCountFor(b._id);
                                            const best = bestStockFor(b._id);

                                            const striped = idx % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent';

                                            return (
                                                <React.Fragment key={b._id}>
                                                    <TableRow
                                                        hover
                                                        sx={{
                                                            backgroundColor: striped,
                                                            '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <IconButton size="small" onClick={() => setOpenLibraries(s => ({ ...s, [b._id]: !s[b._id] }))} aria-label={isOpen ? 'Collapse' : 'Expand'}>
                                                                {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                            </IconButton>
                                                        </TableCell>
                                                        <TableCell sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{b.title}</TableCell>
                                                        <TableCell sx={{ wordBreak: 'break-word' }}>{b.author || '—'}</TableCell>
                                                        <TableCell>{b.genre || '—'}</TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => updateQty(b._id, Math.max(1, Number(it.quantity) - 1))}
                                                                    disabled={!!qtyBusy[b._id]}
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <RemoveIcon fontSize="small" />
                                                                </IconButton>
                                                                <TextField
                                                                    type="number"
                                                                    size="small"
                                                                    value={it.quantity}
                                                                    onChange={e => updateQty(b._id, Math.max(1, Number(e.target.value) || 1))}
                                                                    inputProps={{ min: 1, style: { width: 60, textAlign: 'center' } }}
                                                                    disabled={!!qtyBusy[b._id]}
                                                                />
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => updateQty(b._id, Number(it.quantity) + 1)}
                                                                    disabled={!!qtyBusy[b._id]}
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <AddIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip size="small" label={`${libCount} librar${libCount === 1 ? 'y' : 'ies'}`} />
                                                                <Chip size="small" label={`Best: ${best}`} />
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                                            <Tooltip title="Remove from cart">
                                                                <span>
                                                                    <IconButton color="error" size="small" onClick={() => removeItem(b._id)}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Expanded per-book libraries */}
                                                    <TableRow>
                                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                                                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                                <Box sx={{ my: 2, mx: 1 }}>
                                                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                            Libraries with “{b.title}”
                                                                        </Typography>
                                                                    </Stack>
                                                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                                        <Table size="small" aria-label={`Libraries table for ${b.title}`}>
                                                                            <TableHead>
                                                                                <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.03) } }}>
                                                                                    <TableCell width="32%">Library</TableCell>
                                                                                    <TableCell width="34%">Address</TableCell>
                                                                                    <TableCell width="12%">Stock</TableCell>
                                                                                    <TableCell width="10%">Price</TableCell>
                                                                                    <TableCell width="12%" align="right">Action</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {libs.length === 0 ? (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                                                            Not available in any library
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ) : libs.map(lib => (
                                                                                    <TableRow key={lib.libraryId} hover>
                                                                                        <TableCell sx={{ wordBreak: 'break-word' }}>{lib.libraryName || '—'}</TableCell>
                                                                                        <TableCell sx={{ wordBreak: 'break-word' }}>{lib.address || '—'}</TableCell>
                                                                                        <TableCell>{lib.stock ?? 0}</TableCell>
                                                                                        <TableCell>{lib.price != null ? lib.price : '—'}</TableCell>
                                                                                        <TableCell align="right">
                                                                                            <Button
                                                                                                size="small"
                                                                                                variant="outlined"
                                                                                                onClick={() => {
                                                                                                    if ((Number(lib.stock) || 0) < (Number(it.quantity) || 0)) {
                                                                                                        setSnack({ open: true, severity: 'error', message: `Only ${lib.stock} in stock at ${lib.libraryName}` });
                                                                                                        return;
                                                                                                    }
                                                                                                    setChosenLibrary(lib.libraryId);
                                                                                                    setCheckoutOpen(true);
                                                                                                }}
                                                                                            >
                                                                                                Request Book
                                                                                            </Button>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))}
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

                            {/* Global checkout */}
                            <Stack direction="row" justifyContent="flex-end">
                                <Button
                                    onClick={onCheckout}
                                    variant="contained"
                                    startIcon={<ShoppingCartCheckoutIcon />}
                                    disabled={items.length === 0}
                                >
                                    Request from a Library
                                </Button>
                            </Stack>
                        </React.Fragment>
                    )}
                </CardContent>
            </Card>

            {/* Checkout dialog */}
            <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Select a Library</DialogTitle>
                <DialogContent dividers>
                    {items.length === 0 ? (
                        <Typography color="text.secondary">Your cart is empty.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {eligibleLibraryOptions.length === 0 && (
                                <Alert severity="warning">
                                    No single library can fulfill all items at the requested quantities.
                                    You can still send a request to any library below, but it may be rejected.
                                </Alert>
                            )}
                            <TextField
                                select
                                label="Library"
                                fullWidth
                                value={chosenLibrary}
                                onChange={e => setChosenLibrary(e.target.value)}
                                helperText={eligibleLibraryOptions.length > 0
                                    ? 'Only libraries that can fulfill all items are shown first.'
                                    : 'Showing all libraries with any of your items.'}
                            >
                                {(eligibleLibraryOptions.length > 0 ? eligibleLibraryOptions : allLibraryOptions).map(lib => (
                                    <MenuItem key={lib.libraryId} value={lib.libraryId}>
                                        {lib.libraryName} — {lib.address}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Quick preview: which items fail/succeed for chosen library */}
                            {!!chosenLibrary && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Availability check</Typography>
                                    <Stack spacing={0.5}>
                                        {items.map(it => {
                                            const rec = (availability[it.book._id] || []).find(l => l.libraryId === chosenLibrary);
                                            const ok = rec && (Number(rec.stock) || 0) >= (Number(it.quantity) || 0);
                                            return (
                                                <Typography key={it.book._id} variant="body2" color={ok ? 'success.main' : 'error.main'}>
                                                    {ok ? '✓' : '✕'} {it.book.title} — need {it.quantity}, {rec ? `stock ${rec.stock}` : 'not stocked'}
                                                </Typography>
                                            );
                                        })}
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                    <Button onClick={confirmRequest} disabled={!chosenLibrary || submitting} variant="contained">
                        {submitting ? 'Sending…' : 'Send Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
