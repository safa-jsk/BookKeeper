// src/pages/DashboardFavorites.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, Snackbar, Alert } from '@mui/material';
import BookCard from '../components/BookCard';

function DashboardFavorites() {
    const [books, setBooks] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setBooks(res.data.favorites || []);
            })
            .catch(() => {
                setSnackbar({ open: true, message: 'Failed to load favorites.', severity: 'error' });
            });
    }, []);

    // Remove from Favorites
    const handleRemove = async (bookId) => {
        const token = localStorage.getItem('token');

        // optimistic update
        setBooks(prev => prev.filter(b => b._id !== bookId));

        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/user/books/${bookId}/remove-from-category`,
                { category: 'favorites' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSnackbar({ open: true, message: 'Removed from Favorites.', severity: 'success' });
        } catch (err) {
            // rollback on failure: easiest is to refetch, or keep a snapshot if you prefer
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(res.data.favorites || []);
            setSnackbar({ open: true, message: 'Failed to remove book.', severity: 'error' });
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Favorites</Typography>

            {books.length === 0 ? (
                <Typography>No books in your Favorites.</Typography>
            ) : (
                <Grid container spacing={3} justifyContent="flex-start">
                    {books.map((book) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={book._id}
                            sx={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <BookCard book={book} onRemove={handleRemove} />
                        </Grid>
                    ))}
                </Grid>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={2500}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default DashboardFavorites;
