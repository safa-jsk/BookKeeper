// src/components/LeftDrawer.jsx
import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';

const drawerWidth = 240;

export default function LeftDrawer({ user }) {
    const location = useLocation();
    const role = user?.role || 'reader';
    const { libraryId: routeLib } = useParams();

    // prefer cached id (set after resolve/login), then route param
    const libraryId = localStorage.getItem('myLibraryId') || routeLib || '';

    // base for nested librarian routes (Option B)
    const LIB_BASE = '/dashboard/librarian';
    const inventoryTo = libraryId ? `${LIB_BASE}/${libraryId}/inventory` : LIB_BASE;
    const requestsTo = libraryId ? `${LIB_BASE}/${libraryId}/requests` : LIB_BASE;

    const isSelected = (to) => {
        // Reader pages: exact match
        if (
            to === '/dashboard' ||
            to === '/dashboard/want-to-read' ||
            to === '/dashboard/currently-reading' ||
            to === '/dashboard/favorites' ||
            to === '/dashboard/finished'
        ) {
            return location.pathname === to;
        }

        // Librarian pages: highlight by section
        if (to.startsWith(LIB_BASE)) {
            if (to.endsWith('/inventory')) {
                return location.pathname.startsWith(LIB_BASE) && location.pathname.includes('/inventory');
            }
            if (to.endsWith('/requests')) {
                return location.pathname.startsWith(LIB_BASE) && location.pathname.includes('/requests');
            }
            // plain /dashboard/librarian (resolver)
            return location.pathname === LIB_BASE;
        }
        return false;
    };

    const items = [
        { label: 'Dashboard', to: '/dashboard', show: true },
        { label: 'Want to Read', to: '/dashboard/want-to-read', show: true },
        { label: 'Currently Reading', to: '/dashboard/currently-reading', show: true },
        { label: 'Favorites', to: '/dashboard/favorites', show: true },
        { label: 'Finished', to: '/dashboard/finished', show: true },
        // Librarian extras (Option B paths)
        { label: 'Inventory', to: inventoryTo, show: role === 'librarian' },
        { label: 'Requested Books', to: requestsTo, show: role === 'librarian' },
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
                    <ListItemButton
                        key={it.label}
                        component={Link}
                        to={it.to}
                        selected={isSelected(it.to)}
                    >
                        <ListItemText primary={it.label} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
}
