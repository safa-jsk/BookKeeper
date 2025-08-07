import React from 'react';
import { Typography } from '@mui/material';

export default function Finished({ user }) {
    return (
        <div>
            <Typography variant="h4" sx={{ mb: 2 }}>Welcome, {user?.firstName || "User"}!</Typography>
            <Typography>
                This is your finished books page. Here you can see the books you have finished reading.
            </Typography>
        </div>
    );
}
