import React from 'react';
import { Typography } from '@mui/material';

export default function WantToRead({ user }) {
    return (
        <div>
            <Typography variant="h4" sx={{ mb: 2 }}>Welcome, {user?.firstName || "User"}!</Typography>
            <Typography>
                This is your want to read page. Here you can see the books you want to read.
            </Typography>
        </div>
    );
}
