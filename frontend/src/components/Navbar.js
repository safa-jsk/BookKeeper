import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container } from '@mui/material';

function Navbar() {
  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="lg">
        <Toolbar>
          <Button color="inherit" component={Link} to="/" sx={{ mr: 2 }}>
            BookKeeper
          </Button>
          <Button color="inherit" component={Link} to="/browse" sx={{ mr: 2 }}>
            Browse Books
          </Button>
          <Button color="inherit" component={Link} to="/trending">
            Trending
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
