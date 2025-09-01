import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Box, Typography, Grid, Chip, Fade, Pagination, Snackbar, Alert
} from '@mui/material';
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
    const theme = useTheme();

    const [allBooks, setAllBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Pagination (match BookList)
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 24;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data } = await books.list();
                if (data?.books && Array.isArray(data.books)) setAllBooks(data.books);
                else if (Array.isArray(data)) setAllBooks(data);
                else setAllBooks([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const trendingBase = useMemo(() => {
        return allBooks
            .map(b => ({ ...b, _score: computeTrendingScore(b) }))
            .filter(b => b._score > 15)
            .sort((a, b) => b._score - a._score);
    }, [allBooks]);

    // No search/filter → just paginate the trending list
    const totalBooks = trendingBase.length;
    const totalPages = Math.max(1, Math.ceil(totalBooks / booksPerPage));
    const startIdx = (currentPage - 1) * booksPerPage;
    const pageBooks = trendingBase.slice(startIdx, startIdx + booksPerPage);

    const handlePageChange = (_e, value) => setCurrentPage(value);

    const handleAddToWantToRead = async (bookId) => {
        try {
            await me.addBookToCategory(bookId, 'wantToRead');
            setSnackbar({ open: true, message: 'Book added to Want to Read list!', severity: 'success' });
        } catch (error) {
            setSnackbar({
                open: true,
                message: error?.response?.data?.message || 'Failed to add book to Want to Read list',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
            <Typography
                variant="h4"
                sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textAlign: 'center',
                    mb: 4
                }}
            >
                Trending Books
            </Typography>

            {/* Results Info (match BookList) */}
            {!loading && totalBooks > 0 && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {startIdx + 1} - {Math.min(startIdx + booksPerPage, totalBooks)} of {totalBooks} books
                    </Typography>
                </Box>
            )}

            {/* Grid (match BookList spacing & Fade) */}
            <Grid container spacing={3} justifyContent="center">
                {totalBooks === 0 && !loading && (
                    <Grid item xs={12}>
                        <Typography variant="h6" align="center" sx={{ color: theme.palette.secondary.main }}>
                            No books found.
                        </Typography>
                    </Grid>
                )}

                {pageBooks.map((book) => (
                    <Fade in={!loading} key={book._id}>
                        <Grid item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <BookCard book={book} onWantToRead={() => handleAddToWantToRead(book._id)} />
                                <Chip size="small" label={`Score: ${book._score}`} color="secondary" sx={{ mt: 1 }} />
                            </Box>
                        </Grid>
                    </Fade>
                ))}
            </Grid>

            {/* Pagination (match BookList) */}
            {!loading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
