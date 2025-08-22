// src/pages/DashboardLayout.jsx
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import LeftDrawer from '../components/LeftDrawer';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function DashboardLayout({ user }) {
    const [me, setMe] = useState(user);

    useEffect(() => {
        (async () => {
            try {
                if (!me) {
                    const r = await axios.get(`${API}/api/user/me`, authHeader());
                    setMe(r.data);
                }
            } catch { }
        })();
    }, []); // eslint-disable-line

    return (
        <Box sx={{ display: 'flex' }}>
            <LeftDrawer user={me || user} />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}
