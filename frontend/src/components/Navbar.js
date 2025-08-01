import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Typography } from '@mui/material';

function Navbar({ user, onLogout }) {
  return (
    <AppBar position="sticky" color="primary">
      <Container maxWidth="lg">
        <Toolbar>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/images/logo_w.png"
              alt="BookKeeper Logo"
              style={{ height: 40, marginRight: 20, display: 'block' }}
            />
          </Link>
          <Button color="inherit" component={Link} to="/browse" sx={{ mr: 2 }}>
            Browse Books
          </Button>
          <Button color="inherit" component={Link} to="/trending" sx={{ mr: 2 }}>
            Trending
          </Button>

          {/* Push auth buttons to the right */}
          <div style={{ flexGrow: 1 }} />

          {user && (
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
