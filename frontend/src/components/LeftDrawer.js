// src/components/LeftDrawer.jsx
import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Book as WantToReadIcon,
    Book as CurrentlyReadingIcon,
    Book as FavoritesIcon,
    Book as FinishedIcon,
    Book as RequestsIcon,
    Inventory as InventoryIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';

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
        { label: 'Dashboard', to: '/dashboard', show: true, icon: DashboardIcon },
        { label: 'Want to Read', to: '/dashboard/want-to-read', show: true, icon: WantToReadIcon },
        { label: 'Currently Reading', to: '/dashboard/currently-reading', show: true, icon: CurrentlyReadingIcon },
        { label: 'Favorites', to: '/dashboard/favorites', show: true, icon: FavoritesIcon },
        { label: 'Finished', to: '/dashboard/finished', show: true, icon: FinishedIcon },
        // Librarian extras (Option B paths)
        { label: 'Inventory', to: inventoryTo, show: role === 'librarian', icon: InventoryIcon },
        { label: 'Requested Books', to: requestsTo, show: role === 'librarian', icon: RequestsIcon },
    ].filter(i => i.show);

    // Admin uses a different layout; hide drawer here if admin
    if (role === 'admin') {
        // For admin users, show a simplified drawer with just account settings
        const adminItems = [
            { label: 'Account Settings', to: '/admin/account-settings', icon: SettingsIcon },
        ];

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
                    {adminItems.map(it => (
                        <ListItemButton
                            key={it.label}
                            component={Link}
                            to={it.to}
                            selected={location.pathname === it.to}
                        >
                            <it.icon sx={{ mr: 2, fontSize: 20 }} />
                            <ListItemText primary={it.label} />
                        </ListItemButton>
                    ))}
                </List>
            </Drawer>
        );
    }

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
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'primary.light',
                                '&:hover': {
                                    backgroundColor: 'primary.light',
                                }
                            }
                        }}
                    >
                        <it.icon sx={{ mr: 2, fontSize: 20 }} />
                        <ListItemText primary={it.label} />
                    </ListItemButton>
                ))}
            </List>
        </Drawer>
    );
}
