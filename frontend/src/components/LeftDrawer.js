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
    Settings as SettingsIcon,
    People as PeopleIcon,
    LibraryBooks as LibraryBooksIcon,
    Book as BookIcon,
    PendingActions as PendingIcon,
    Assignment as AssignmentIcon,
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
            to === '/dashboard/finished' ||
            to === '/dashboard/account-settings'
        ) {
            return location.pathname === to;
        }

        // Admin pages: exact match
        if (
            to === '/admin' ||
            to === '/admin/librarian-applications' ||
            to === '/admin/users' ||
            to === '/admin/libraries' ||
            to === '/admin/books' ||
            to === '/admin/inventory' ||
            to === '/admin/requests' ||
            to === '/admin/account-settings'
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

    // Define navigation items based on role
    const getNavigationItems = () => {
        if (role === 'admin') {
            return [
                { label: 'Dashboard', to: '/admin', icon: DashboardIcon },
                { label: 'Librarian Applications', to: '/admin/librarian-applications', icon: AssignmentIcon },
                { label: 'Users', to: '/admin/users', icon: PeopleIcon },
                { label: 'Libraries', to: '/admin/libraries', icon: LibraryBooksIcon },
                { label: 'Books', to: '/admin/books', icon: BookIcon },
                { label: 'Book Inventory', to: '/admin/inventory', icon: InventoryIcon },
                { label: 'Requests', to: '/admin/requests', icon: PendingIcon },
                { label: 'Account Settings', to: '/admin/account-settings', icon: SettingsIcon },
            ];
        }

        if (role === 'librarian') {
            return [
                { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
                { label: 'Want to Read', to: '/dashboard/want-to-read', icon: WantToReadIcon },
                { label: 'Currently Reading', to: '/dashboard/currently-reading', icon: CurrentlyReadingIcon },
                { label: 'Favorites', to: '/dashboard/favorites', icon: FavoritesIcon },
                { label: 'Finished', to: '/dashboard/finished', icon: FinishedIcon },
                { label: 'Inventory', to: inventoryTo, icon: InventoryIcon },
                { label: 'Requested Books', to: requestsTo, icon: RequestsIcon },
                { label: 'Account Settings', to: '/dashboard/account-settings', icon: SettingsIcon },
            ];
        }

        // Default for readers
        return [
            { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
            { label: 'Want to Read', to: '/dashboard/want-to-read', icon: WantToReadIcon },
            { label: 'Currently Reading', to: '/dashboard/currently-reading', icon: CurrentlyReadingIcon },
            { label: 'Favorites', to: '/dashboard/favorites', icon: FavoritesIcon },
            { label: 'Finished', to: '/dashboard/finished', icon: FinishedIcon },
            { label: 'Account Settings', to: '/dashboard/account-settings', icon: SettingsIcon },
        ];
    };

    const items = getNavigationItems();

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
