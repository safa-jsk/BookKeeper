import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardMedia, Typography, Button, Box, TextField } from '@mui/material';

function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    user: '',
    rating: 5,
    comment: ''
  });

  // Fetch book details
  useEffect(() => {
    axios.get(`http://localhost:5000/api/books/${id}`)
      .then(res => {
        console.log(res.data);  // Check if reviews and image are populated correctly
        setBook(res.data);
        setLoading(false);
      })
      .catch(err => {
        setBook(null);
        setLoading(false);
      });
  }, [id]);

  // Handle review form submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();

    axios.post(`http://localhost:5000/api/books/${id}/reviews`, newReview)
      .then(res => {
        setBook(res.data);  // Update the book with the new review
        setNewReview({ user: '', rating: 5, comment: '' });  // Reset the form
      })
      .catch(err => {
        alert('Error submitting review.');
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found.</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{book.title}</Typography>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        <Card sx={{ maxWidth: 200 }}>
          <CardMedia
            component="img"
            image={book.image ? `/${book.image}` : '/default-book-cover.jpg'}
            alt={book.title}
            height="300"
          />
        </Card>
        <Box>
          <Typography variant="h6"><strong>Author:</strong> {book.author}</Typography>
          <Typography variant="h6"><strong>Genre:</strong> {book.genre}</Typography>
          <Typography variant="h6"><strong>Year:</strong> {book.year}</Typography>
          <Typography variant="h6"><strong>Rating:</strong> {book.rating}</Typography>

          {/* Add Review Form */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Add a Review</Typography>
            <form onSubmit={handleReviewSubmit}>
              <TextField
                label="Your Name"
                fullWidth
                required
                value={newReview.user}
                onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Rating (1-5)"
                fullWidth
                required
                type="number"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                inputProps={{ min: 1, max: 5 }}
                sx={{ mb: 2 }}
              />
              <TextField
                label="Your Review"
                fullWidth
                required
                multiline
                rows={4}
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary" type="submit">
                Submit Review
              </Button>
            </form>
          </Box>
        </Box>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Reviews</Typography>
        <Box sx={{ mt: 2 }}>
          {book.reviews.map((review, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6"><strong>{review.user}</strong> rated it {review.rating} / 5</Typography>
                <Typography>{review.comment}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      <Link to="/browse">
        <Button variant="outlined" color="primary" sx={{ mt: 3 }}>
          Back to Browse
        </Button>
      </Link>
    </Box>
  );
}

export default BookDetail;
