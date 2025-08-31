import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import {
  Typography, Grid, Box, FormControl, InputLabel, Select, MenuItem, Fade, Pagination, Snackbar, Alert
} from '@mui/material';
import BookCard from '../components/BookCard';


function BookList() {
  const theme = useTheme();

  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('none');
  const [currentPage, setCurrentPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    booksPerPage: 24,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchBooks = async (query = '', filter = 'none', page = 1) => {
    setLoading(true);
    try {
      const params = { query, filter, page, limit: 24 };
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/search`, { params });

      if (response.data.books && response.data.pagination) {
        setBooks(response.data.books);
        setPagination(response.data.pagination);
      } else {
        // Fallback for old API format
        setBooks(response.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalBooks: response.data.length,
          booksPerPage: 24,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch {
      setBooks([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalBooks: 0,
        booksPerPage: 24,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Real-time search with debounce on query/filter
  useEffect(() => {
    const handle = setTimeout(() => {
      // If rating filter is selected but query is empty, show nothing until user provides a value
      if (filter === 'rating' && !searchQuery.trim()) {
        setBooks([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalBooks: 0,
          booksPerPage: 24,
          hasNextPage: false,
          hasPrevPage: false
        });
        return;
      }
      setCurrentPage(1); // Reset to first page when search changes
      fetchBooks(searchQuery, filter, 1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery, filter]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    fetchBooks(searchQuery, filter, value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks(searchQuery, filter, 1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 700, letterSpacing: 2, textAlign: 'center', mb: 4 }}>
        Browse Books
      </Typography>

      {/* Search & Filter Row */}
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          mb: 4
        }}
      >
        <FormControl size="small" sx={{ minWidth: 130, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            label="Filter"
            onChange={e => setFilter(e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="author">Author</MenuItem>
            <MenuItem value="genre">Genre</MenuItem>
            <MenuItem value="rating">Rating (Min)</MenuItem>
          </Select>
        </FormControl>
        <input
          type="text"
          placeholder={filter === "rating" ? "Minimum rating (e.g. 4)" : "Search..."}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            width: '60%',
            borderRadius: '8px',
            border: `1.5px solid ${theme.palette.info.main}`,
            background: theme.palette.background.default,
            color: theme.palette.primary.main,
            fontSize: 16,
            outline: 'none'
          }}
        />
      </Box>

      {/* Results Info */}
      {!loading && books.length > 0 && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {((currentPage - 1) * 24) + 1} - {Math.min(currentPage * 24, pagination.totalBooks)} of {pagination.totalBooks} books
          </Typography>
        </Box>
      )}

      <Grid
        container
        spacing={3}
        justifyContent="center"
      >
        {books.length === 0 && !loading && (
          <Grid item xs={12}>
            <Typography variant="h6" align="center" sx={{ color: theme.palette.secondary.main }}>
              No books found.
            </Typography>
          </Grid>
        )}
        {books.map((book) => (
          <Fade in={!loading} key={book._id}>
            <Grid item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <BookCard book={book} />
            </Grid>
          </Fade>
        ))}
      </Grid>

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
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

export default BookList;
