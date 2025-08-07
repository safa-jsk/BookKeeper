import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import {
  Typography, Button, Grid, Box, FormControl, InputLabel, Select, MenuItem, Fade
} from '@mui/material';
import BookCard from '../components/BookCard';


function BookList() {
  const theme = useTheme();

  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('none');

  const fetchBooks = async (query = '', filter = 'none') => {
    setLoading(true);
    try {
      const params = { query };
      if (filter && filter !== 'none') params.filter = filter;
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/books/search`, { params });
      setBooks(response.data);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(searchQuery, filter);
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
        <Button
          variant="contained"
          color="primary"
          type="submit"
          sx={{
            padding: '10px 28px',
            background: theme.palette.primary.main,
            borderRadius: 2,
            fontWeight: 600,
            letterSpacing: 1,
            boxShadow: 2,
            '&:hover': { background: theme.palette.secondary.main }
          }}
        >
          Search
        </Button>
      </Box>

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
    </Box>
  );
}

export default BookList;
