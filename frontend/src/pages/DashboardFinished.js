import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Snackbar, Alert
} from '@mui/material';
import BookCard from '../components/BookCard';

function DashboardFinished({ user }) {
    const [books, setBooks] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const [review, setReview] = useState({ rating: 5, comment: '' });
    const [submitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchFinishedBooks();
    }, []);

    const fetchFinishedBooks = async () => {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setBooks(res.data.finished || []);
    };

    const handleOpenDialog = (book) => {
        setSelectedBook(book);
        setReview({ rating: 5, comment: '' });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedBook(null);
    };

    const handleReviewSubmit = async (bookId, rating, comment) => {
        const token = localStorage.getItem('token');
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/books/${bookId}/reviews`,
                {
                    user: `${user.firstName} ${user.lastName}`,
                    rating,
                    comment
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optionally, show a success message or refresh reviews list
            handleCloseDialog();
        } catch (err) {
            // Optionally, show error message
        }
    };

    return (
        <>
            <Typography variant="h4" sx={{ mb: 3 }}>Finished Books</Typography>
            <Grid container spacing={3}>
                {books.length === 0 ? (
                    <Typography sx={{ m: 4 }}>No books marked as finished.</Typography>
                ) : (
                    books.map(book => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                            <BookCard book={book} onReview={handleOpenDialog} />
                        </Grid>
                    ))
                )}
            </Grid>

            {/* Review Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Add Review for {selectedBook?.title}
                </DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    handleReviewSubmit(selectedBook._id, review.rating, review.comment);
                }}>
                    <DialogContent>
                        <Typography sx={{ mb: 1 }}>
                            <b>Reviewer:</b> {user ? `${user.firstName} ${user.lastName}` : "Your Name"}
                        </Typography>
                        <TextField
                            margin="normal"
                            label="Rating (1-5)"
                            type="number"
                            fullWidth
                            required
                            inputProps={{ min: 1, max: 5 }}
                            value={review.rating}
                            onChange={e => setReview({ ...review, rating: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            label="Comment"
                            fullWidth
                            required
                            multiline
                            rows={3}
                            value={review.comment}
                            onChange={e => setReview({ ...review, comment: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
                        <Button type="submit" color="primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

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

export default DashboardFinished;
