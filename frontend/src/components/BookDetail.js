import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Grid, CardMedia, Typography, Button, Box, TextField, Divider, Paper
} from '@mui/material';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });

  useEffect(() => {
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(res => {
        setBook(res.data);
        setLoading(false);
      })
      .catch(() => {
        setBook(null);
        setLoading(false);
      });
  }, [id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/api/books/${id}/reviews`, newReview)
      .then(res => {
        setBook(res.data);
        setNewReview({ user: '', rating: 5, comment: '' });
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found.</div>;

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: '1200px', mx: 'auto' }}>
      <Grid
        container
        spacing={4}
        alignItems="flex-start"
        direction={{ xs: 'column-reverse', md: 'row' }}
      >
        {/* LEFT: Book details and reviews */}
        <Grid item xs={12} md={7} lg={8}>
          <Typography
            variant="h3"
            sx={{
              color: '#4B3D2D',
              mb: 1,
              wordBreak: 'break-word',
              maxWidth: { xs: '100%', sm: 500, md: 600 },
              whiteSpace: 'pre-line',
            }}
          >
            {book.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#8B5B29' }}>by {book.author}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Genre:</strong> {book.genre}
          </Typography>
          <Typography variant="body1"><strong>Year:</strong> {book.year}</Typography>
          <Typography variant="body1"><strong>Rating:</strong> {book.rating ? book.rating.toFixed(1) : 'N/A'} / 5.0</Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>Description</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {book.description || 'No description available.'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 1 }}>Reviews</Typography>
          {book.reviews && book.reviews.length > 0 ? (
            book.reviews.map((review, idx) => (
              <Paper key={idx} sx={{ mb: 2, p: 2, background: '#F8F6F1', maxWidth: 600 }}>
                <Typography variant="subtitle2">
                  <strong>{review.user}</strong> rated {review.rating}/5
                </Typography>
                <Typography variant="body2">{review.comment}</Typography>
              </Paper>
            ))
          ) : (
            <Typography>No reviews yet.</Typography>
          )}

          <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 4, maxWidth: 600 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add a Review</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={7}>
                <TextField
                  label="Your Name"
                  fullWidth
                  required
                  value={newReview.user}
                  onChange={e => setNewReview({ ...newReview, user: e.target.value })}
                  sx={{ minWidth: 380 }}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  label="Rating (1-5)"
                  type="number"
                  inputProps={{ min: 1, max: 5 }}
                  fullWidth
                  required
                  value={newReview.rating}
                  onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
                  sx={{ minWidth: 120 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Your Review"
                  fullWidth
                  multiline
                  rows={3}
                  required
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  sx={{ minWidth: 520 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Submit Review
                </Button>
              </Grid>
            </Grid>

            <Link to="/browse">
              <Button variant="outlined" color="primary" sx={{ mt: 3 }}>
                Back to Browse
              </Button>
            </Link>

          </Box>
        </Grid>

        {/* RIGHT: Book cover image - fixed at the top right */}
        <Grid item xs={12} md={5} lg={4}
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', md: 'flex-end' },
            alignItems: { xs: 'flex-start', md: 'flex-start' }
          }}>
          <Box
            sx={{
              width: 360,
              height: 480,
              bgcolor: '#fff',
              borderRadius: 2,
              overflow: 'hidden',
              border: '2px solid #C2B280',
              boxShadow: 2,
              mb: 2,
              position: { md: 'sticky' },
              top: { md: 100 },
              zIndex: 1,
              mt: { xs: 2, md: 0 }
            }}
          >
            <CardMedia
              component="img"
              image={book.image ? `/${book.image}` : '/default-book-cover.jpg'}
              alt={book.title}
              sx={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BookDetail;
