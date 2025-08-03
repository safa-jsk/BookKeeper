import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, CardMedia, Typography, Button, Grid, Box, FormControl,
  InputLabel, Select, MenuItem, Fade
} from '@mui/material';
import { Link } from 'react-router-dom';

const palette = {
  primary: '#4B3D2D',
  accent: '#C2B280',
  brown: '#8B5B29',
  beige: '#E3D4B9',
  light: '#D9CBA0'
};

function BookList() {
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
      <Typography variant="h4" sx={{ color: palette.primary, fontWeight: 700, letterSpacing: 2, textAlign: 'center', mb: 4 }}>
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
        <FormControl size="small" sx={{ minWidth: 130, bgcolor: palette.beige, borderRadius: 2 }}>
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
            border: `1.5px solid ${palette.accent}`,
            background: palette.beige,
            color: palette.primary,
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
            background: palette.primary,
            borderRadius: 2,
            fontWeight: 600,
            letterSpacing: 1,
            boxShadow: 2,
            '&:hover': { background: palette.brown }
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
            <Typography variant="h6" align="center" sx={{ color: palette.brown }}>
              No books found.
            </Typography>
          </Grid>
        )}
        {books.map((book) => (
          <Fade in={!loading} key={book._id}>
            <Grid item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card
                sx={{
                  width: 250,
                  height: 390,
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  background: palette.beige,
                  boxShadow: '0 4px 16px #0001',
                  border: `2px solid ${palette.light}`,
                  transition: 'transform 0.22s',
                  '&:hover': {
                    boxShadow: '0 8px 24px #0002',
                    transform: 'scale(1.035)',
                    borderColor: palette.primary
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="170"
                  image={book.image ? `/${book.image}` : '/default-book-cover.jpg'}
                  alt={book.title}
                  sx={{
                    objectFit: 'cover',
                    borderRadius: '12px 12px 0 0',
                    background: palette.light
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography gutterBottom variant="h6" component="div" align="center" sx={{
                    color: palette.primary,
                    fontWeight: 700,
                    fontSize: 17,
                    lineHeight: 1.15,
                    height: 44, // clamp two lines
                    overflow: 'hidden'
                  }}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color={palette.primary} align="center">
                    <strong>Author:</strong> {book.author}
                  </Typography>
                  <Typography variant="body2" color={palette.primary} align="center">
                    <strong>Genre:</strong> {book.genre}
                  </Typography>
                  <Typography variant="body2" color={palette.primary} align="center">
                    <strong>Rating:</strong> {book.rating ? book.rating.toFixed(1) : 'N/A'}
                  </Typography>
                </CardContent>
                <Button
                  size="small"
                  component={Link}
                  to={`/books/${book._id}`}
                  color="primary"
                  sx={{
                    borderRadius: 0,
                    background: palette.primary,
                    color: '#fff',
                    fontWeight: 600,
                    letterSpacing: 1,
                    mb: 1,
                    transition: 'background 0.18s',
                    '&:hover': {
                      background: palette.brown
                    }
                  }}
                >
                  View Details
                </Button>
              </Card>
            </Grid>
          </Fade>
        ))}
      </Grid>
    </Box>
  );
}

export default BookList;
