import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, TextField, Button, Autocomplete,
    FormControlLabel, Checkbox, FormHelperText,
    CircularProgress, InputAdornment, Alert
} from '@mui/material';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import axios from 'axios';

const FALLBACK_CITIES = [
    'Dhaka', 'Chattogram', 'Rajshahi', 'Barishal', 'Sylhet',
    'Khulna', 'Cumilla', 'Mymensingh', 'Rangpur', 'Gazipur'
];

const GENRE_OPTIONS = [
    'Fiction', 'Non-Fiction', 'Romance', 'Thriller', 'Mystery', 'Fantasy', 'Sci-Fi',
    'Historical', 'Biography', 'Self-Help', 'Poetry', 'Drama', 'Horror', 'Children',
    'Young Adult', 'Comics/Manga', 'Classic', 'Philosophy', 'Religion', 'Travel'
];

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - apiBase: string (e.g., process.env.REACT_APP_API_URL)
 * - authHeader: () => ({ headers: { Authorization: `Bearer ${token}` } })
 * - defaultCity?: string
 * - onSubmitted?: () => void   // e.g., set pending in parent
 */
export default function LibraryApplicationDialog({
    open,
    onClose,
    apiBase,
    authHeader,
    defaultCity = '',
    onSubmitted
}) {
    const [cities, setCities] = useState([]);
    const [applyLoading, setApplyLoading] = useState(false);
    const [serverMsg, setServerMsg] = useState(null);

    const [form, setForm] = useState({
        libraryName: '',
        address1: '',
        address2: '',
        city: '',
        zip: '',
        ownerPhone: '',
        genres: [],
        website: '',
        about: '',
        termsAccepted: false
    });

    // phone uniqueness check
    const [phoneCheck, setPhoneCheck] = useState({ checking: false, available: null, msg: '' });
    const phoneDebounceRef = useRef(null);

    const resetState = () => {
        setForm({
            libraryName: '',
            address1: '',
            address2: '',
            city: defaultCity || '',
            zip: '',
            ownerPhone: '',
            genres: [],
            website: '',
            about: '',
            termsAccepted: false
        });
        setPhoneCheck({ checking: false, available: null, msg: '' });
        setServerMsg(null);
    };

    useEffect(() => {
        if (!open) return;
        resetState();
        (async () => {
            try {
                const res = await axios.get(`${apiBase}/api/librarian/cities`, authHeader());
                const list = Array.isArray(res.data) ? res.data : [];
                setCities(list.length ? list : FALLBACK_CITIES);
            } catch {
                setCities(FALLBACK_CITIES);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const phoneLooksValid = (p) => {
        const digits = (p || '').replace(/[^\d]/g, '');
        return digits.length >= 10 && digits.length <= 15;
    };

    const checkPhoneUnique = (value) => {
        clearTimeout(phoneDebounceRef.current);
        if (!value || !phoneLooksValid(value)) {
            setPhoneCheck({ checking: false, available: null, msg: '' });
            return;
        }
        phoneDebounceRef.current = setTimeout(async () => {
            setPhoneCheck({ checking: true, available: null, msg: '' });
            try {
                const r = await axios.get(`${apiBase}/api/librarian/check-phone`, {
                    ...authHeader(),
                    params: { phone: value }
                });
                setPhoneCheck({
                    checking: false,
                    available: !!r.data?.available,
                    msg: r.data?.available ? 'Phone is available' : 'Phone already used in an application'
                });
            } catch {
                setPhoneCheck({ checking: false, available: null, msg: 'Could not verify phone' });
            }
        }, 450);
    };

    const isValid = () => {
        return (
            form.libraryName.trim().length >= 2 &&
            form.address1.trim().length >= 3 &&
            !!form.city &&
            form.zip.trim().length >= 3 &&
            phoneLooksValid(form.ownerPhone) &&
            phoneCheck.available === true &&
            Array.isArray(form.genres) && form.genres.length >= 3 &&
            form.termsAccepted === true
        );
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!isValid()) {
            setServerMsg({ type: 'warning', text: 'Please complete required fields (min 3 genres, valid & unique phone).' });
            return;
        }
        setApplyLoading(true);
        setServerMsg(null);
        try {
            await axios.post(`${apiBase}/api/librarian/apply`, {
                libraryName: form.libraryName.trim(),
                address1: form.address1.trim(),
                address2: form.address2.trim(),
                city: form.city,
                zip: form.zip.trim(),
                ownerPhone: form.ownerPhone.trim(),
                genres: form.genres,
                website: form.website.trim(),
                about: form.about.trim(),
                termsAccepted: form.termsAccepted,
                motivation: `Applying for Librarian: ${form.libraryName} in ${form.city}`
            }, authHeader());

            onSubmitted?.(); // e.g., set pending badge in parent
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to submit application.';
            setServerMsg({ type: 'error', text: msg });
        } finally {
            setApplyLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle>Apply to be a Librarian</DialogTitle>
            <DialogContent dividers>
                {serverMsg && (
                    <Alert sx={{ mb: 2 }} severity={serverMsg.type}>{serverMsg.text}</Alert>
                )}
                <form onSubmit={submit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Library Name"
                                fullWidth required
                                value={form.libraryName}
                                onChange={e => setForm(f => ({ ...f, libraryName: e.target.value }))}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Address Line 1"
                                fullWidth required
                                value={form.address1}
                                onChange={e => setForm(f => ({ ...f, address1: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address Line 2"
                                fullWidth
                                value={form.address2}
                                onChange={e => setForm(f => ({ ...f, address2: e.target.value }))}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={cities.length ? cities : FALLBACK_CITIES}
                                value={form.city || null}
                                onChange={(_, v) => setForm(f => ({ ...f, city: v || '' }))}
                                renderInput={(params) => (
                                    <TextField {...params} label="City" required />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="ZIP / Postal Code"
                                fullWidth required
                                value={form.zip}
                                onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Owner Phone Number"
                                fullWidth required
                                value={form.ownerPhone}
                                onChange={e => {
                                    const v = e.target.value;
                                    setForm(f => ({ ...f, ownerPhone: v }));
                                    checkPhoneUnique(v);
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIphoneIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: phoneCheck.checking ? (
                                        <InputAdornment position="end">
                                            <CircularProgress size={18} />
                                        </InputAdornment>
                                    ) : null
                                }}
                                error={phoneCheck.available === false}
                                helperText={phoneCheck.msg}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={GENRE_OPTIONS}
                                value={form.genres}
                                onChange={(_, v) => setForm(f => ({ ...f, genres: v }))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Genres (pick at least 3)"
                                        helperText={
                                            (form.genres?.length || 0) < 3
                                                ? 'Select at least 3 genres'
                                                : `${form.genres.length} selected`
                                        }
                                        error={(form.genres?.length || 0) < 3}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Website (optional)"
                                fullWidth
                                value={form.website}
                                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="About / Notes (optional)"
                                fullWidth
                                value={form.about}
                                onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={form.termsAccepted}
                                        onChange={e => setForm(f => ({ ...f, termsAccepted: e.target.checked }))}
                                    />
                                }
                                label="I confirm the information is accurate and I agree to be contacted."
                            />
                            {!form.termsAccepted && <FormHelperText error>Required</FormHelperText>}
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={applyLoading} sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button
                    onClick={submit}
                    variant="contained"
                    disabled={applyLoading || !isValid()}
                    sx={{ textTransform: 'none' }}
                >
                    {applyLoading ? 'Submitting…' : 'Submit Application'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
