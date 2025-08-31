import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardHeader, CardContent, Grid, Typography, Chip, Stack, Snackbar, Alert } from '@mui/material';
import BookCard from '../components/BookCard';
import { books, me } from '../services/api';

function computeTrendingScore(book) {
    const want = Array.isArray(book.wantToReadBy) ? book.wantToReadBy.length : 0;
    const finished = Array.isArray(book.finishedBy) ? book.finishedBy.length : 0;
    const favorited = Array.isArray(book.favoritedBy) ? book.favoritedBy.length : 0;
    const reading = Array.isArray(book.currentlyReadingBy) ? book.currentlyReadingBy.length : 0;
    return want * 3 + finished * 4 + favorited * 5 + reading * 3;
}

export default function Trending() {
    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await books.list();
                // Handle new pagination format
                if (data.books && Array.isArray(data.books)) {
                    setAllBooks(data.books);
                } else if (Array.isArray(data)) {
                    // Fallback for old format
                    setAllBooks(data);
                } else {
                    setAllBooks([]);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAddToWantToRead = async (bookId) => {
        try {
            await me.addBookToCategory(bookId, 'wantToRead');
            setSnackbar({
                open: true,
                message: 'Book added to Want to Read list!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error adding book to want to read:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to add book to Want to Read list',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const trending = useMemo(() => {
        return allBooks
            .map(b => ({ ...b, _score: computeTrendingScore(b) }))
            .filter(b => b._score > 15)
            .sort((a, b) => b._score - a._score);
    }, [allBooks]);

    return (
        <Box p={3}>
            <Card>
                <CardHeader title="Trending Books" subheader="Based on community activity and favorites" />
                <CardContent>
                    {loading ? (
                        <Typography color="text.secondary">Loading…</Typography>
                    ) : trending.length === 0 ? (
                        <Typography color="text.secondary">No trending books yet.</Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {trending.map(book => (
                                <Grid item key={book._id} xs={12} sm={6} md={4} lg={3}>
                                    <Stack spacing={1} alignItems="center">
                                        <BookCard book={book} onWantToRead={handleAddToWantToRead} />
                                        <Chip size="small" color="secondary" label={`Trending Score: ${book._score}`} />
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}


