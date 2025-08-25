// src/pages/LibrarianHomeResolver.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, CircularProgress, Stack } from '@mui/material';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function LibrarianHomeResolver() {
    const nav = useNavigate();
    const [err, setErr] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const cached = localStorage.getItem('myLibraryId');
                if (cached) return nav(`/librarian/${cached}/inventory`, { replace: true });
                const r = await axios.get(`${API}/api/librarian/my-library`, authHeader());
                const id = r?.data?._id;
                if (id) {
                    localStorage.setItem('myLibraryId', id);
                    nav(`/librarian/${id}/inventory`, { replace: true });
                } else {
                    setErr('Could not resolve your library.');
                }
            } catch (e) {
                const code = e?.response?.data?.code;
                const msg =
                    code === 'PENDING' ? 'Your librarian application is still pending.' :
                        code === 'REJECTED' ? 'Your librarian application was rejected.' :
                            code === 'NO_APP' ? 'You have not applied to be a librarian yet.' :
                                'Unable to resolve your library.';
                setErr(msg);
            }
        })();
    }, [nav]);

    if (err) return <Box p={3}><Alert severity="warning">{err}</Alert></Box>;

    return (
        <Box p={3}>
            <Stack alignItems="center" justifyContent="center" minHeight="40vh">
                <CircularProgress />
            </Stack>
        </Box>
    );
}
