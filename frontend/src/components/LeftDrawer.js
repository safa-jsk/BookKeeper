// src/components/LeftDrawer.jsx
import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';

const drawerWidth = 260;

export default function LeftDrawer({ user }) {
    const location = useLocation();
    const role = user?.role || 'reader';
    const { libraryId: routeLib } = useParams();
    const libraryId = localStorage.getItem('libraryId') || routeLib || '';

    const items = [
        { label: 'Want to Read', to: '/dashboard/want-to-read', show: true },
        { label: 'Currently Reading', to: '/dashboard/currently-reading', show: true },
        { label: 'Favorites', to: '/dashboard/favorites', show: true },
        { label: 'Finished', to: '/dashboard/finished', show: true },
        // Librarian extras
        { label: 'Inventory', to: libraryId ? `/librarian/${libraryId}/inventory` : '/librarian', show: role === 'librarian' },
        { label: 'Requested Books', to: libraryId ? `/librarian/${libraryId}/requests` : '/librarian', show: role === 'librarian' },
    ].filter(i => i.show);

    // Admin uses a different layout; hide drawer here if admin
    if (role === 'admin') return null;

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
            }}
        >
            <Toolbar />
            <List>
                {items.map(it => (
                    <ListItemButton key={it.label} component={Link} to={it.to} selected={location.pathname === it.to}>
                        <ListItemText primary={it.label} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
}
