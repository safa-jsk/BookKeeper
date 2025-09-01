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

    // per-book assignment for split checkout: { [bookId]: libraryId }
    const [assigned, setAssigned] = useState({});

    // checkout dialog (single-library flow)
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [chosenLibrary, setChosenLibrary] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submittingSplit, setSubmittingSplit] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await getCart();
            setCart(data.cart);
            setAvailability(data.availability || {});
            // prune assignments for books that no longer exist in cart
            const ids = new Set((data.cart?.items || []).map(i => i.book._id));
            setAssigned(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(k => { if (!ids.has(k)) delete next[k]; });
                return next;
            });
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

    const assignLibrary = (bookId, libraryId) => {
        setAssigned(s => ({ ...s, [bookId]: libraryId }));
        setSnack({ open: true, severity: 'success', message: 'Assigned library for this book.' });
    };
    const clearAssignment = (bookId) => setAssigned(s => {
        const n = { ...s }; delete n[bookId]; return n;
    });

    // Build union of libraries present anywhere
    const allLibraryOptions = useMemo(() => {
        const map = {};
        Object.values(availability).forEach(list => {
            (list || []).forEach(lib => { map[lib.libraryId] = lib; });
        });
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
        const score = (lib) => (cart?.items || []).reduce((s, it) => {
            const rec = (availability[it.book._id] || []).find(x => x.libraryId === lib.libraryId);
            return s + (rec ? Number(rec.stock) || 0 : 0);
        }, 0);
        return eligible.sort((a, b) => score(b) - score(a));
    }, [cart, availability, allLibraryOptions]);

    const onCheckout = () => {
        setChosenLibrary('');
        setCheckoutOpen(true);
    };

    // PARTIAL checkout to a single library (fulfillable subset only)
    const confirmRequest = async () => {
        if (!chosenLibrary) return;

        const items = (cart?.items || []);
        // split: fulfillable vs not
        const fulfillable = items.filter(it => {
            const rec = (availability[it.book._id] || []).find(l => l.libraryId === chosenLibrary);
            return rec && (Number(rec.stock) || 0) >= (Number(it.quantity) || 0);
        });
        const skipped = items.filter(it => !fulfillable.includes(it));

        if (fulfillable.length === 0) {
            setSnack({ open: true, severity: 'error', message: 'No items are in stock at the selected library.' });
            return;
        }

        setSubmitting(true);
        try {
            const payload = fulfillable.map(it => ({ bookId: it.book._id || it.book, quantity: it.quantity }));
            await createRequest(chosenLibrary, payload);

            // remove only the requested ones from cart
            await Promise.all(fulfillable.map(it => removeCartItem(it.book._id || it.book)));
            await load();

            const msg = skipped.length > 0
                ? `Request sent for ${fulfillable.length} item(s). ${skipped.length} item(s) not available at this library.`
                : 'Request sent for all items.';
            setSnack({ open: true, severity: skipped.length ? 'warning' : 'success', message: msg });
            setCheckoutOpen(false);
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to place request.';
            setSnack({ open: true, severity: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    // QUICK single-book request from a specific library row
    const requestSingle = async ({ libraryId, bookId, quantity }) => {
        try {
            await createRequest(libraryId, [{ bookId, quantity }]);
            await removeCartItem(bookId);
            await load();
            setSnack({ open: true, severity: 'success', message: 'Request sent for 1 item.' });
        } catch (e) {
            const msg = e?.response?.data?.message || 'Failed to place request.';
            setSnack({ open: true, severity: 'error', message: msg });
        }
    };

    // SPLIT checkout: send requests grouped by assigned library
    const confirmSplitRequests = async () => {
        const items = cart?.items || [];
        // build library -> items[]
        const byLib = {};
        const skipped = [];

        for (const it of items) {
            const bookId = it.book._id;
            const libId = assigned[bookId];
            if (!libId) continue; // not assigned => ignore
            const rec = (availability[bookId] || []).find(l => l.libraryId === libId);
            if (rec && (Number(rec.stock) || 0) >= (Number(it.quantity) || 0)) {
                (byLib[libId] ||= []).push({ bookId, quantity: it.quantity });
            } else {
                skipped.push(it.book.title);
            }
        }

        const libIds = Object.keys(byLib);
        if (libIds.length === 0) {
            setSnack({ open: true, severity: 'warning', message: 'No assigned items are currently fulfillable.' });
            return;
        }

        setSubmittingSplit(true);
        const successes = [];
        const failures = [];

        for (const libId of libIds) {
            try {
                await createRequest(libId, byLib[libId]);
                successes.push(libId);
            } catch (e) {
                failures.push(libId);
            }
        }

        // remove requested items that succeeded
        if (successes.length) {
            const requestedBookIds = new Set(
                successes.flatMap(id => byLib[id].map(i => i.bookId))
            );
            await Promise.all(
                Array.from(requestedBookIds).map(bid => removeCartItem(bid))
            );
        }

        await load();

        let message = '';
        if (successes.length) message += `Requests sent to ${successes.length} librar${successes.length === 1 ? 'y' : 'ies'}. `;
        if (failures.length) message += `${failures.length} request${failures.length === 1 ? '' : 's'} failed. `;
        if (skipped.length) message += `Skipped (insufficient stock): ${skipped.join(', ')}`;

        setSnack({
            open: true,
            severity: failures.length ? 'warning' : 'success',
            message: message || 'Done.'
        });

        setSubmittingSplit(false);
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
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Split checkout: send to assigned libraries">
                                <span>
                                    <Button
                                        variant="outlined"
                                        onClick={confirmSplitRequests}
                                        disabled={submittingSplit || Object.keys(assigned).length === 0}
                                    >
                                        Send Assigned
                                    </Button>
                                </span>
                            </Tooltip>
                            <Tooltip title="Refresh">
                                <span>
                                    <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
                                        Refresh
                                    </Button>
                                </span>
                            </Tooltip>
                        </Stack>
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
                                            <TableCell width="30%">Book</TableCell>
                                            <TableCell width="16%">Author</TableCell>
                                            <TableCell width="10%">Genre</TableCell>
                                            <TableCell width="12%">Quantity</TableCell>
                                            <TableCell width="20%">Availability</TableCell>
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
                                            const assignedLibId = assigned[b._id];
                                            const assignedLib = libs.find(l => l.libraryId === assignedLibId);

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
                                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                                                <Chip size="small" label={`${libCount} librar${libCount === 1 ? 'y' : 'ies'}`} />
                                                                <Chip size="small" label={`Best: ${best}`} />
                                                                {assignedLib ? (
                                                                    <Chip
                                                                        size="small"
                                                                        color="success"
                                                                        label={`Assigned: ${assignedLib.libraryName}`}
                                                                        onDelete={() => clearAssignment(b._id)}
                                                                    />
                                                                ) : (
                                                                    <Chip size="small" label="No assignment" variant="outlined" />
                                                                )}
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
                                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                                                        Libraries with “{b.title}”
                                                                    </Typography>
                                                                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                                        <Table size="small" aria-label={`Libraries table for ${b.title}`}>
                                                                            <TableHead>
                                                                                <TableRow sx={{ '& th': { fontWeight: 700, backgroundColor: alpha(theme.palette.primary.main, 0.03) } }}>
                                                                                    <TableCell width="32%">Library</TableCell>
                                                                                    <TableCell width="34%">Address</TableCell>
                                                                                    <TableCell width="12%">Stock</TableCell>
                                                                                    <TableCell width="10%">Price</TableCell>
                                                                                    <TableCell width="12%" align="right">Actions</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {libs.length === 0 ? (
                                                                                    <TableRow>
                                                                                        <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                                                                            Not available in any library
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ) : libs.map(lib => {
                                                                                    const can = (Number(lib.stock) || 0) >= (Number(it.quantity) || 0);
                                                                                    const isAssigned = assignedLibId === lib.libraryId;
                                                                                    return (
                                                                                        <TableRow key={lib.libraryId} hover>
                                                                                            <TableCell sx={{ wordBreak: 'break-word' }}>{lib.libraryName || '—'}</TableCell>
                                                                                            <TableCell sx={{ wordBreak: 'break-word' }}>{lib.address || '—'}</TableCell>
                                                                                            <TableCell>{lib.stock ?? 0}</TableCell>
                                                                                            <TableCell>{lib.price != null ? lib.price : '—'}</TableCell>
                                                                                            <TableCell align="right">
                                                                                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                                                                    <Button
                                                                                                        size="small"
                                                                                                        variant={isAssigned ? 'contained' : 'outlined'}
                                                                                                        color={isAssigned ? 'success' : 'primary'}
                                                                                                        onClick={() => assignLibrary(b._id, lib.libraryId)}
                                                                                                    >
                                                                                                        {isAssigned ? 'Assigned' : 'Assign'}
                                                                                                    </Button>
                                                                                                    <Button
                                                                                                        size="small"
                                                                                                        variant="outlined"
                                                                                                        onClick={() => {
                                                                                                            if (!can) {
                                                                                                                setSnack({ open: true, severity: 'error', message: `Only ${lib.stock} in stock at ${lib.libraryName}` });
                                                                                                                return;
                                                                                                            }
                                                                                                            requestSingle({ libraryId: lib.libraryId, bookId: b._id, quantity: it.quantity });
                                                                                                        }}
                                                                                                    >
                                                                                                        Request Book
                                                                                                    </Button>
                                                                                                </Stack>
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

                            {/* Global checkout */}
                            <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                <Button
                                    onClick={onCheckout}
                                    variant="contained"
                                    startIcon={<ShoppingCartCheckoutIcon />}
                                    disabled={items.length === 0}
                                >
                                    Request from a Single Library
                                </Button>
                            </Stack>
                        </React.Fragment>
                    )}
                </CardContent>
            </Card>

            {/* Single-library checkout dialog (partial allowed) */}
            <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Select a Library</DialogTitle>
                <DialogContent dividers>
                    {items.length === 0 ? (
                        <Typography color="text.secondary">Your cart is empty.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {eligibleLibraryOptions.length === 0 && (
                                <Alert severity="info">
                                    If the selected library lacks some items, we’ll send a request for the items it can fulfill and leave the others in your cart.
                                </Alert>
                            )}
                            <TextField
                                select
                                label="Library"
                                fullWidth
                                value={chosenLibrary}
                                onChange={e => setChosenLibrary(e.target.value)}
                                helperText={eligibleLibraryOptions.length > 0
                                    ? 'Libraries that can fulfill everything are shown first.'
                                    : 'Pick any library; only available items will be requested.'}
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
