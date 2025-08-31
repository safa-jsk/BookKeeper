// src/pages/admin/AdminLayout.jsx
import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, Toolbar, Box } from '@mui/material';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    LibraryBooks as LibraryBooksIcon,
    Book as BookIcon,
    Inventory as InventoryIcon,
    PendingActions as PendingIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

export default function AdminLayout() {
    const location = useLocation();
    const items = [
        { label: 'Dashboard', to: '/admin', icon: DashboardIcon },
        { label: 'Librarian Applications', to: '/admin/librarian-applications', icon: AssignmentIcon },
        { label: 'Users', to: '/admin/users', icon: PeopleIcon },
        { label: 'Libraries', to: '/admin/libraries', icon: LibraryBooksIcon },
        { label: 'Books', to: '/admin/books', icon: BookIcon },
        { label: 'Book Inventory', to: '/admin/inventory', icon: InventoryIcon },
        { label: 'Requests', to: '/admin/requests', icon: PendingIcon },
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
                        <ListItemButton
                            key={it.to}
                            component={Link}
                            to={it.to}
                            selected={location.pathname === it.to}
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
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
