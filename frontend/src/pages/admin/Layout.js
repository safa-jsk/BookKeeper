// src/pages/admin/Layout.js
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import LeftDrawer from '../../components/LeftDrawer';

export default function AdminLayout({ user }) {
    return (
        <Box sx={{ display: 'flex' }}>
            <LeftDrawer user={user} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
