import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import Login from './Login';
import Register from './Register';

function Home({ setUser }) {
  const [selectedForm, setSelectedForm] = useState('login');

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#E3D4B9', py: { xs: 2, md: 8 }, px: 2 }}>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{
          height: { md: 'calc(100vh - 64px)' }, // make grid fill screen (minus navbar)
          maxWidth: 'lg',
          margin: '0 auto',
        }}
      >
        {/* LEFT SIDE */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: { xs: 'auto', md: '100%' }
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Paper elevation={6} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3, width: '100%', maxWidth: 540, textAlign: 'center' }}>
              <Typography variant="h2" sx={{ color: '#4B3D2D', fontWeight: 700, mb: 2 }}>
                Welcome to
              </Typography>
              <img src="/images/logo_brown.png" alt="BookKeeper Logo" style={{ height: 100, marginBottom: 16 }} />
              <Typography variant="h5" sx={{ color: '#8B5B29', mb: 4 }}>
                Your AI-powered library companion.
              </Typography>
              <Box>
                <Button
                  component={Link}
                  to="/browse"
                  size="large"
                  variant="contained"
                  sx={{
                    bgcolor: '#4B3D2D', color: '#fff', px: 4, py: 1.5, fontSize: 20, borderRadius: 2,
                    '&:hover': { bgcolor: '#8B5B29' }
                  }}
                >
                  Browse Books
                </Button>
                <Button
                  component={Link}
                  to="/trending"
                  size="large"
                  variant="outlined"
                  sx={{
                    ml: 2, color: '#4B3D2D', borderColor: '#8B5B29',
                    px: 4, py: 1.5, fontSize: 20, borderRadius: 2,
                    bgcolor: '#E3D4B9',
                    '&:hover': { bgcolor: '#D9CBA0', borderColor: '#4B3D2D' }
                  }}
                >
                  Trending
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* RIGHT SIDE */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: { xs: 'auto', md: '100%' }
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                minWidth: 340,
                width: '100%',
                maxWidth: 600,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <ToggleButtonGroup
                color="primary"
                value={selectedForm}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue) setSelectedForm(newValue);
                }}
                sx={{ mb: 2 }}
              >
                <ToggleButton
                  value="login"
                  sx={{
                    width: 120,
                    color: '#4B3D2D',
                    backgroundColor: '#E3D4B9',
                    '&.Mui-selected': {
                      backgroundColor: '#4B3D2D',
                      color: '#fff',
                    },
                    '&:hover': {
                      backgroundColor: '#C2B280',
                    }
                  }}
                >
                  Login
                </ToggleButton>
                <ToggleButton
                  value="register"
                  sx={{
                    width: 120,
                    color: '#4B3D2D',
                    backgroundColor: '#E3D4B9',
                    '&.Mui-selected': {
                      backgroundColor: '#4B3D2D',
                      color: '#fff',
                    },
                    '&:hover': {
                      backgroundColor: '#C2B280',
                    }
                  }}
                >
                  Register
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Show Login or Register form below the toggles */}
              {selectedForm === 'login' ? (
                <Login onLogin={setUser} />
              ) : (
                <Register onRegister={setUser} />
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
