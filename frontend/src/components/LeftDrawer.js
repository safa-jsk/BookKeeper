// src/components/LeftDrawer.jsx
import React, { useState, useMemo } from 'react';
import {
    Drawer, List, ListItemButton, ListItemText, ListItemIcon, Toolbar,
    IconButton, Tooltip, Box
} from '@mui/material';
import { Link, useLocation, useParams } from 'react-router-dom';

// Unique icons for each entry
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';     // Admin Dashboard
import DashboardIcon from '@mui/icons-material/Dashboard';               // Reader/Librarian Dashboard
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';     // Want to Read
import MenuBookIcon from '@mui/icons-material/MenuBook';                 // Currently Reading
import FavoriteIcon from '@mui/icons-material/Favorite';                 // Favorites
import CheckCircleIcon from '@mui/icons-material/CheckCircle';           // Finished
import PendingActionsIcon from '@mui/icons-material/PendingActions';     // Requests / Requested Books
import Inventory2Icon from '@mui/icons-material/Inventory2';             // Librarian Inventory
import InventoryIcon from '@mui/icons-material/Inventory';               // Admin Book Inventory
import SettingsIcon from '@mui/icons-material/Settings';                 // Settings
import PeopleIcon from '@mui/icons-material/People';                     // Users
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';         // Libraries
import AutoStoriesIcon from '@mui/icons-material/AutoStories';           // Books
import ApprovalIcon from '@mui/icons-material/Approval';                 // Librarian Applications

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const drawerWidth = 240;
const collapsedWidth = 72;

export default function LeftDrawer({ user }) {
    const location = useLocation();
    const role = user?.role || 'reader';
    const { libraryId: routeLib } = useParams();

    // prefer cached id (set after resolve/login), then route param
    const libraryId = localStorage.getItem('myLibraryId') || routeLib || '';

    // base for nested librarian routes (Option B)
    const LIB_BASE = '/dashboard/librarian';
    const inventoryTo = libraryId ? `${LIB_BASE}/${libraryId}/inventory` : `${LIB_BASE}`;
    const requestsTo = libraryId ? `${LIB_BASE}/${libraryId}/requests` : `${LIB_BASE}`;

    const [open, setOpen] = useState(true);
    const toggle = () => setOpen(o => !o);

    const isSelected = (to) => {
        // Reader pages: exact match
        if (
            to === '/dashboard' ||
            to === '/dashboard/want-to-read' ||
            to === '/dashboard/currently-reading' ||
            to === '/dashboard/favorites' ||
            to === '/dashboard/finished' ||
            to === '/dashboard/account-settings'
        ) return location.pathname === to;

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
        ) return location.pathname === to;

        // Librarian pages: highlight by section
        if (to.startsWith(LIB_BASE)) {
            if (to.endsWith('/inventory')) {
                return location.pathname.startsWith(LIB_BASE) && location.pathname.includes('/inventory');
            }
            if (to.endsWith('/requests')) {
                return location.pathname.startsWith(LIB_BASE) && location.pathname.includes('/requests');
            }
            return location.pathname === LIB_BASE; // resolver
        }
        return false;
    };

    // Define navigation items based on role
    const items = useMemo(() => {
        if (role === 'admin') {
            return [
                { label: 'Dashboard', to: '/admin', icon: SpaceDashboardIcon },
                { label: 'Librarian Applications', to: '/admin/librarian-applications', icon: ApprovalIcon },
                { label: 'Users', to: '/admin/users', icon: PeopleIcon },
                { label: 'Libraries', to: '/admin/libraries', icon: LocalLibraryIcon },
                { label: 'Books', to: '/admin/books', icon: AutoStoriesIcon },
                { label: 'Book Inventory', to: '/admin/inventory', icon: InventoryIcon },
                { label: 'Requests', to: '/admin/requests', icon: PendingActionsIcon },
                { label: 'Account Settings', to: '/admin/account-settings', icon: SettingsIcon },
            ];
        }
        if (role === 'librarian') {
            return [
                { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
                { label: 'Want to Read', to: '/dashboard/want-to-read', icon: BookmarkBorderIcon },
                { label: 'Currently Reading', to: '/dashboard/currently-reading', icon: MenuBookIcon },
                { label: 'Favorites', to: '/dashboard/favorites', icon: FavoriteIcon },
                { label: 'Finished', to: '/dashboard/finished', icon: CheckCircleIcon },
                { label: 'Inventory', to: inventoryTo, icon: Inventory2Icon },
                { label: 'Requested Books', to: requestsTo, icon: PendingActionsIcon },
                { label: 'Account Settings', to: '/dashboard/account-settings', icon: SettingsIcon },
            ];
        }
        // reader
        return [
            { label: 'Dashboard', to: '/dashboard', icon: DashboardIcon },
            { label: 'Want to Read', to: '/dashboard/want-to-read', icon: BookmarkBorderIcon },
            { label: 'Currently Reading', to: '/dashboard/currently-reading', icon: MenuBookIcon },
            { label: 'Favorites', to: '/dashboard/favorites', icon: FavoriteIcon },
            { label: 'Finished', to: '/dashboard/finished', icon: CheckCircleIcon },
            { label: 'Account Settings', to: '/dashboard/account-settings', icon: SettingsIcon },
        ];
    }, [role, inventoryTo, requestsTo]);

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : collapsedWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : collapsedWidth,
                    boxSizing: 'border-box',
                    overflowX: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    flexDirection: 'column',
                    // Let width animate
                    transition: theme => theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen
                    }),
                }
            }}
        >
            {/* Keeps top spacing for your Navbar height */}
            <Toolbar />

            {/* Scrollable nav list */}
            <List sx={{ flex: 1, overflowY: 'auto', pt: 0 }}>
                {items.map(it => {
                    const selected = isSelected(it.to);
                    const content = (
                        <ListItemButton
                            key={it.label}
                            component={Link}
                            to={it.to}
                            selected={selected}
                            sx={{
                                px: open ? 2 : 1.2,
                                justifyContent: open ? 'initial' : 'center',
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    '&:hover': { backgroundColor: 'primary.light' }
                                }
                            }}
                        >
                            <ListItemIcon
                                sx={{ minWidth: 0, mr: open ? 2 : 0, justifyContent: 'center' }}
                            >
                                <it.icon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                                primary={it.label}
                                sx={{ opacity: open ? 1 : 0 }}
                                primaryTypographyProps={{ noWrap: true }}
                            />
                        </ListItemButton>
                    );

                    // Tooltips only when collapsed
                    return open ? (
                        <Box key={it.label}>{content}</Box>
                    ) : (
                        <Tooltip key={it.label} title={it.label} placement="right" arrow>
                            <Box>{content}</Box>
                        </Tooltip>
                    );
                })}
            </List>

            {/* Bottom collapse/expand control */}
            <Box
                sx={{
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: 1,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Tooltip title={open ? 'Collapse' : 'Expand'} placement="right" arrow>
                    <IconButton onClick={toggle} aria-label={open ? 'Collapse' : 'Expand'}>
                        {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Drawer>
    );
}
