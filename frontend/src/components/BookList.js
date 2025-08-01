import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, CardContent, CardMedia, Typography, Button, Grid, Box,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Link } from 'react-router-dom';

function BookList() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('none');

  // Fetch books with optional search/filter
  const fetchBooks = async (query = '', filter = 'none') => {
    setLoading(true);
    try {
      const params = { query };
      if (filter && filter !== 'none') params.filter = filter;
      const response = await axios.get('http://localhost:5000/api/books/search', { params });
      setBooks(response.data);
    } catch (err) {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();  // Fetch all books on load
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(searchQuery, filter);  // Fetch books with search/filter
  };

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Browse Books
      </Typography>

      {/* Search Form with Filter Dropdown */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'center',
          marginBottom: 24
        }}
      >
        <FormControl size="small" sx={{ minWidth: 130 }}>
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
          placeholder={filter === "rating" ? "Enter minimum rating (e.g. 4)" : "Search..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '10px',
            width: '60%',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
        <Button variant="contained" color="primary" type="submit" sx={{ padding: '10px 20px' }}>
          Search
        </Button>
      </form>

      {/* Book Grid */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
      >
        {books.length === 0 && !loading && (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">No books found.</Typography>
          </Grid>
        )}
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={book._id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Card sx={{ width: 260, height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', m: 'auto' }}>
              <CardMedia
                component="img"
                height="200"
                image={book.image || '/default-book-cover.jpg'}
                alt={book.title}
                sx={{ objectFit: 'cover', width: '100%' }}
              />
              <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                <Typography gutterBottom variant="h6" component="div" align="center">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  <strong>Author:</strong> {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  <strong>Genre:</strong> {book.genre}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  <strong>Rating:</strong> {book.rating ? book.rating.toFixed(1) : 'N/A'}
                </Typography>
              </CardContent>
              <Button size="small" component={Link} to={`/books/${book._id}`} color="primary">
                View Details
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default BookList;
