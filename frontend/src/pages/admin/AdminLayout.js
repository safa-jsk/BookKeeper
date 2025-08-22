// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Box } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 260;

export default function AdminLayout() {
    const location = useLocation();
    const items = [
        { label: 'Librarian Applications', to: '/admin/librarian-applications' },
        { label: 'Books', to: '/admin/books' },
        { label: 'Book Inventory', to: '/admin/inventory' },
        { label: 'Users', to: '/admin/users' },
        { label: 'Libraries', to: '/admin/libraries' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
            >
                <Toolbar />
                <List>
                    {items.map(it => (
                        <ListItemButton key={it.to} component={Link} to={it.to} selected={location.pathname === it.to}>
                            <ListItemText primary={it.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
