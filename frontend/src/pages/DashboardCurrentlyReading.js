import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Grid, Typography, Snackbar, Alert, CircularProgress, Box
} from '@mui/material';
import BookCard from '../components/BookCard';

function DashboardCurrentlyReading() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchCurrentlyReading = async () => {
        const token = localStorage.getItem('token');
        try {
            // GET the dashboard payload (router mounted at /api/dashboard)
            const res = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/dashboard`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBooks(res.data?.currentlyReading || []); // already Book[]
        } catch (e) {
            console.error('Reading fetch error:', e?.response?.status, e?.response?.data || e?.message);
            setSnackbar({ open: true, message: 'Failed to load currently reading.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentlyReading();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAddToFinished = async (bookId) => {
        const token = localStorage.getItem('token');

        let snapshot;
        setBooks(prev => {
            snapshot = prev; // for rollback
            return prev.filter(b => b._id !== bookId);
        });

        try {
            // Match your mounted route: /api/dashboard/...
            await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/dashboard/users/me/reading/${bookId}/finish`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSnackbar({ open: true, message: 'Moved to Finished!', severity: 'success' });
        } catch (e) {
            setBooks(snapshot); // rollback
            setSnackbar({ open: true, message: 'Could not move. Try again.', severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Typography variant="h4" sx={{ mb: 3 }}>Currently Reading</Typography>
            <Grid container spacing={3}>
                {books.length === 0 ? (
                    <Typography sx={{ m: 4 }}>No books in progress.</Typography>
                ) : (
                    books.map(b => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={b._id}>
                            <BookCard
                                book={b}
                                onAddToFinished={() => handleAddToFinished(b._id)}
                            />
                        </Grid>
                    ))
                )}
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default DashboardCurrentlyReading;
