import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Typography } from '@mui/material';

function Navbar({ user, onLogout }) {
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
          <Button color="inherit" component={Link} to="/trending" sx={{ mr: 2 }}>
            Trending
          </Button>

          {/* Push auth buttons to the right */}
          <div style={{ flexGrow: 1 }} />

          {!user ? (
            <>
              <Button color="inherit" component={Link} to="/login" sx={{ mr: 2 }}>
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.firstName}!
              </Typography>
              <Button color="inherit" onClick={onLogout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
