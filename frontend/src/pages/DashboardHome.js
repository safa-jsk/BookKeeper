import React from 'react';
import { Typography } from '@mui/material';

export default function DashboardHome({ user }) {
    return (
        <div>
            <Typography variant="h4" sx={{ mb: 2 }}>Welcome, {user?.firstName || "User"}!</Typography>
            <Typography>
                This is your dashboard overview. Add charts, stats, or recent activity here.
            </Typography>
        </div>
    );
}
