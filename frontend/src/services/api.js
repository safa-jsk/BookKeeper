import axios from 'axios';

const api = axios.create({
    // For Vite projects, use the following line:
    baseURL: import.meta.env.VITE_API_BASE_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000',
    // For Create React App projects, use the following line instead:
    // baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

export default api;
