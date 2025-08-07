import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, Snackbar, Alert } from '@mui/material';
import BookCard from '../components/BookCard';

function DashboardWantToRead() {
    const [books, setBooks] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setBooks(res.data.wantToRead || []);
            });
    }, []);

    // Remove handler
    const handleRemove = async (bookId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/user/books/${bookId}/remove-from-category`,
                { category: 'wantToRead' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update local state
            setBooks(books => books.filter(b => b._id !== bookId));
        } catch (err) {
            // Optionally show a Snackbar
            alert('Failed to remove book.');
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3 }}>Want to Read</Typography>
            {books.length === 0 ? (
                <Typography>No books in your Want to Read list.</Typography>
            ) : (
                <Grid container spacing={3} justifyContent="flex-start">
                    {books.map((book) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={book._id} sx={{ display: 'flex', justifyContent: 'center' }}>
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
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default DashboardWantToRead;
