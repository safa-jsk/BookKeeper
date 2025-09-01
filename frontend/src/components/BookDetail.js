import React, { useEffect, useState, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Grid, CardMedia, Typography, Button, Box, TextField, Divider, Paper, Stack,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Link as MuiLink, Rating
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import BookmarkRemoveOutlinedIcon from '@mui/icons-material/BookmarkRemoveOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { addCartItem } from '../services/api';

const CATEGORIES = [
  { key: 'wantToRead', label: 'Want to Read' },
  { key: 'currentlyReading', label: 'Currently Reading' },
  { key: 'finished', label: 'Finished' },
  { key: 'favorites', label: 'Favorite' }
];

function getUserFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    const u = payload.user || payload;
    return {
      firstName: u.firstName || u.given_name || '',
      lastName: u.lastName || u.family_name || '',
      name: u.name || ''
    };
  } catch {
    return null;
  }
}

function getUserFullNameFromToken() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    const user = payload.user || payload;
    const first = user.firstName || user.given_name || '';
    const last = user.lastName || user.family_name || '';
    return [first, last].filter(Boolean).join(' ') || user.name || '';
  } catch {
    return '';
  }
}


function BookDetail() {
  const theme = useTheme();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [categories, setCategories] = useState({});
  const [linksOpen, setLinksOpen] = useState(false);
  const [userFullName, setUserFullName] = useState('');

  const isLoggedIn = useMemo(() => Boolean(localStorage.getItem('token')), []);

  useEffect(() => {
    const userFullName = getUserFullNameFromToken();
    setUserFullName(userFullName);
    setNewReview(prev => ({ ...prev, user: userFullName || prev.user }));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const u = getUserFromToken();
    if (u) {
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '';
      setNewReview(prev => ({ ...prev, user: fullName }));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/books/${id}`)
      .then(res => {
        setBook(res.data);
        setLoading(false);
      })
      .catch(() => {
        setBook(null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!book) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${process.env.REACT_APP_API_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setCategories({
        wantToRead: res.data.wantToRead.map(b => b._id),
        finished: res.data.finished.map(b => b._id),
        favorites: res.data.favorites.map(b => b._id),
        currentlyReading: res.data.currentlyReading.map(b => b._id),
      });
    });
  }, [book]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/api/books/${id}/reviews`, newReview)
      .then(res => {
        setBook(res.data);
        setNewReview(r => ({ ...r, comment: '' }));
        setSnackbar({ open: true, message: 'Review submitted!', severity: 'success' });
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to submit review', severity: 'error' }));
  };

  const isBookInCategory = (category) =>
    book && categories[category]?.includes(book._id);

  const handleCategoryToggle = async (categoryKey, action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setSnackbar({ open: true, message: 'Please log in.', severity: 'warning' });
      return;
    }
    const url = `${process.env.REACT_APP_API_URL}/api/user/books/${book._id}/${action === "add" ? "add-to-category" : "remove-from-category"}`;
    try {
      await axios.post(url, { category: categoryKey }, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(prev => {
        const updated = { ...prev };
        updated[categoryKey] = action === 'add'
          ? [...(updated[categoryKey] || []), book._id]
          : (updated[categoryKey] || []).filter(_id => _id !== book._id);
        return updated;
      });
      setSnackbar({ open: true, message: `Book ${action === 'add' ? 'added to' : 'removed from'} ${categoryKey}`, severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Action failed', severity: 'error' });
    }
  };

  const buildProviderLinks = () => {
    const encodedTitle = encodeURIComponent(book.title || '');
    const encodedAuthor = encodeURIComponent(book.author || '');
    const query = encodeURIComponent(`${encodedTitle || ''} ${encodedAuthor || ''}`.trim());
    const isbn = (book.isbn || '').trim();
    return {
      googleBooks: isbn
        ? `https://www.google.com/search?tbm=bks&q=isbn:${encodeURIComponent(isbn)}`
        : `https://www.google.com/search?tbm=bks&q=${query}`,
      openLibrary: isbn
        ? `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}`
        : `https://openlibrary.org/search?q=${query}`,
      amazon: isbn
        ? `https://www.amazon.com/s?k=${encodeURIComponent(isbn)}`
        : `https://www.amazon.com/s?k=${query}`,
      googleSearchRead: `https://www.google.com/search?q=${query}+read+online`,
    };
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found.</div>;

  return (
    <Box sx={{ p: { xs: 2, md: 5 }, maxWidth: '1200px', mx: 'auto' }}>
      <Grid
        container
        spacing={4}
        alignItems="flex-start"
        justifyContent="center"                 // center the whole grid in the page
        direction={{ xs: 'column', md: 'row' }} // LEFT then RIGHT (never reversed)
      >
        {/* LEFT: Book details and reviews */}
        <Grid item xs={12} md={7} lg={8} sx={{ minWidth: 0 }}>
          <Typography
            variant="h3"
            sx={{
              color: theme.palette.primary.main,
              mb: 1,
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
            }}
          >
            {book.title}
          </Typography>

          <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.main }}>
            by {book.author}
          </Typography>

          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Genre:</strong> {book.genre}
          </Typography>

          {/* Rating: text first, then numeric, then stars */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Typography variant="body1"><strong>Rating:</strong></Typography>
            <Typography variant="body1">
              {book.rating ? book.rating.toFixed(1) : 'N/A'} / 5.0
            </Typography>
            <Rating value={book.rating || 0} precision={0.5} readOnly />
          </Stack>

          <Typography variant="body1" sx={{ mt: 1 }}>
            <strong>Published Year:</strong> {book.year}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 2 }}>Summary</Typography>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word'
            }}
          >
            {book.summary || 'No summary available.'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h5" sx={{ mb: 1 }}>Reviews</Typography>
          {book.reviews && book.reviews.length > 0 ? (
            book.reviews.map((review, idx) => (
              <Paper key={idx} sx={{ mb: 2, p: 2, bgcolor: 'action.hover', maxWidth: 600 }}>
                <Typography variant="subtitle2">
                  <strong>{review.user}</strong> rated {review.rating}/5
                </Typography>
                <Typography variant="body2">{review.comment}</Typography>
              </Paper>
            ))
          ) : (
            <Typography>No reviews yet.</Typography>
          )}

          {/* Add a Review: only if logged in */}
          {isLoggedIn ? (
            <Box component="form" onSubmit={handleReviewSubmit} sx={{ mt: 4, maxWidth: 600 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Add a Review</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={7}>
                  <TextField
                    label="Your Name"
                    fullWidth
                    required
                    value={userFullName || 'Name taken from account'}
                    InputProps={{ readOnly: true }}
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
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary">
                    Submit Review
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Link to="/browse">
              <Button variant="outlined" color="primary" sx={{ mt: 3 }} startIcon={<ArrowBackIcon />}>
                Back to Browse
              </Button>
            </Link>
          )}
        </Grid>

        {/* RIGHT: Book cover image & actions (always to the right on md+) */}
        <Grid item xs={12} md={5} lg={4}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { xs: 'center', md: 'flex-start' },
            alignItems: { xs: 'center', md: 'flex-end' }
          }}>
          <Box
            sx={{
              width: 360,
              bgcolor: theme.palette.background.paper,
              borderRadius: 2,
              overflow: 'hidden',
              border: `2px solid ${theme.palette.info.main}`,
              boxShadow: 2,
              mb: 2,
              position: { md: 'sticky' },
              top: { md: 100 },
              zIndex: 1,
              mt: { xs: 2, md: 0 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <CardMedia
              component="img"
              image={book.image || '/images/books/harry-potter-and-the-philosophers-stone.jpg'}
              alt={book.title}
              sx={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
            />

            <Stack direction="column" spacing={2} sx={{ my: 2, width: '90%' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddShoppingCartIcon />}
                onClick={async () => {
                  try {
                    await addCartItem(book._id, 1);
                    setSnackbar({ open: true, message: 'Added to cart', severity: 'success' });
                  } catch (e) {
                    setSnackbar({ open: true, message: 'Failed to add to cart', severity: 'error' });
                  }
                }}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Add to Cart
              </Button>

              {CATEGORIES.map(cat => {
                const inCat = isBookInCategory(cat.key);
                let addIcon = <BookmarkAddOutlinedIcon />;
                let removeIcon = <BookmarkRemoveOutlinedIcon />;
                if (cat.key === 'currentlyReading') { addIcon = <MenuBookOutlinedIcon />; removeIcon = <RemoveCircleOutlineIcon />; }
                if (cat.key === 'finished') { addIcon = <CheckCircleOutlineIcon />; removeIcon = <RemoveCircleOutlineIcon />; }
                if (cat.key === 'favorites') { addIcon = <FavoriteBorderOutlinedIcon />; removeIcon = <FavoriteOutlinedIcon />; }

                return (
                  <Button
                    key={cat.key}
                    variant={inCat ? "outlined" : "contained"}
                    color="primary"
                    onClick={() => handleCategoryToggle(cat.key, inCat ? "remove" : "add")}
                    startIcon={inCat ? removeIcon : addIcon}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    {inCat ? `Remove from ${cat.label}` : `Add to ${cat.label}`}
                  </Button>
                );
              })}

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<OpenInNewIcon />}
                onClick={() => setLinksOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Find Online (Read/Buy)
              </Button>
            </Stack>
          </Box>

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
        </Grid>
      </Grid>

      <Dialog open={linksOpen} onClose={() => setLinksOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Find “{book.title}” Online</DialogTitle>
        <DialogContent dividers>
          {(() => {
            const links = buildProviderLinks();
            return (
              <Stack spacing={1}>
                <Typography>Choose a source:</Typography>
                <MuiLink href={links.googleBooks} target="_blank" rel="noopener" underline="hover">
                  Google Books (previews and stores)
                </MuiLink>
                <MuiLink href={links.openLibrary} target="_blank" rel="noopener" underline="hover">
                  Open Library (borrow/read options)
                </MuiLink>
                <MuiLink href={links.amazon} target="_blank" rel="noopener" underline="hover">
                  Amazon (buy)
                </MuiLink>
                <MuiLink href={links.googleSearchRead} target="_blank" rel="noopener" underline="hover">
                  Google Search: read online
                </MuiLink>
              </Stack>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinksOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookDetail;
