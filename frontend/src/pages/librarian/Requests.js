import React, { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardHeader, CardContent, Stack, Typography, Button, Snackbar, Alert } from '@mui/material';
import { requests } from '../../services/api';

export default function LibrarianRequests({ libraryId }) {
    const [rows, setRows] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

    const load = useCallback(async () => {
        const { data } = await requests.listForLibrary(libraryId, 'pending');
        setRows(data);
    }, [libraryId]);

    useEffect(() => {
        if (libraryId) load();
    }, [libraryId, load]);

    const approve = async (id) => {
        try {
            await requests.approve(libraryId, id);
            setSnack({ open: true, severity: 'success', message: 'Approved & stock updated' });
            setRows(rows => rows.filter(r => r._id !== id));
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to approve' });
        }
    };

    const reject = async (id) => {
        try {
            await requests.reject(libraryId, id);
            setSnack({ open: true, severity: 'info', message: 'Rejected' });
            setRows(rows => rows.filter(r => r._id !== id));
        } catch (e) {
            setSnack({ open: true, severity: 'error', message: e?.response?.data?.message || 'Failed to reject' });
        }
    };

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Requested Books" subheader="Approve or reject user requests" />
                <CardContent>
                    <Stack spacing={2}>
                        {rows.length === 0 ? (
                            <Typography color="text.secondary">No pending requests.</Typography>
                        ) : rows.map(req => (
                            <Card key={req._id} variant="outlined">
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {req.user?.firstName} {req.user?.lastName} — {req.user?.email}
                                            </Typography>
                                            <Stack spacing={0.5} mt={1}>
                                                {req.items.map((it, idx) => (
                                                    <Typography key={idx} variant="body2">
                                                        • {it.book?.title} — {it.book?.author} (x{it.quantity})
                                                    </Typography>
                                                ))}
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" spacing={1}>
                                            <Button onClick={() => approve(req._id)} variant="contained">Approve</Button>
                                            <Button onClick={() => reject(req._id)} color="error" variant="outlined">Reject</Button>
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
