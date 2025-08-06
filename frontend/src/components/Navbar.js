import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Container, Menu, MenuItem } from '@mui/material';

function Navbar({ user, onLogout }) {
  let effectiveUser = user;
  if (!effectiveUser) {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== "undefined") {
        effectiveUser = JSON.parse(userStr);
      }
    } catch {
      effectiveUser = null;
    }
  }

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#4B3D2D',
        boxShadow: '0 2px 8px rgba(75,61,45,0.06)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 72 }}>
          {/* Logo on Left */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: 3
            }}
          >
            <img
              src="/images/logo_w.png"
              alt="BookKeeper"
              style={{
                height: 44,
                width: 'auto',
                marginRight: 8,
                objectFit: 'contain'
              }}
            />
          </Box>

          {/* Nav Buttons */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/browse"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                textTransform: 'none',
                color: '#E3D4B9',
                '&:hover': { color: '#C2B280' }
              }}
            >
              Browse Books
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/trending"
              sx={{
                fontSize: 18,
                fontWeight: 600,
                textTransform: 'none',
                color: '#E3D4B9',
                '&:hover': { color: '#C2B280' }
              }}
            >
              Trending
            </Button>
          </Box>

          {/* User Dropdown */}
          {effectiveUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ fontWeight: 500 }}
              >
                Welcome, {effectiveUser.firstName}
              </Button>
              <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <MenuItem component={Link} to="/dashboard" onClick={() => setAnchorEl(null)}>
                  Dashboard
                </MenuItem>
                <MenuItem component={Link} to="/dashboard/account-settings" onClick={() => setAnchorEl(null)}>
                  Account Settings
                </MenuItem>
                <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : null}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
