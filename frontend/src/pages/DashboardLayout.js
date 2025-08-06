import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';

const menu = [
    { text: 'Dashboard', path: '/dashboard' },
    { text: 'Want To Read', path: '/dashboard/want-to-read' },
    { text: 'Finished', path: '/dashboard/finished' },
    { text: 'Currently Reading', path: '/dashboard/currently-reading' },
    { text: 'Favorites', path: '/dashboard/favorites' },
    { text: 'Account Settings', path: '/dashboard/account-settings' }
];

export default function DashboardLayout({ user, onLogout }) {
    const location = useLocation();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: 220,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 220,
                        boxSizing: 'border-box',
                        bgcolor: '#efe2b4',
                        top: '64px',                  // AppBar height here
                        height: 'calc(100vh - 64px)', // Matches AppBar height
                        position: 'fixed',
                        boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
                        borderRight: 0, // optional: removes default right border
                    }
                }}
            >
                <List>
                    {menu.map(({ text, path }) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={path}
                                selected={location.pathname === path}
                            >
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
            {/* Content - Remove any redundant margin or extra padding here */}
            <Box
                sx={{
                    flexGrow: 1,
                    p: { xs: 1, md: 4 },
                    bgcolor: '#f8e8ca',
                    minHeight: '100vh',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
