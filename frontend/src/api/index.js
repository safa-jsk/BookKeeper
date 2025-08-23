// src/api/index.js
import axios from 'axios';

export const API = process.env.REACT_APP_API_URL;
export const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export const getCart = () => axios.get(`${API}/api/cart`, authHeader());
export const addCartItem = (bookId, quantity = 1) => axios.post(`${API}/api/cart/items`, { bookId, quantity }, authHeader());
export const removeCartItem = (bookId) => axios.delete(`${API}/api/cart/items/${bookId}`, authHeader());

export const createRequest = (libraryId, items) =>
    axios.post(`${API}/api/requests`, { libraryId, items }, authHeader());

export const listLibraryInventory = (libraryId) =>
    axios.get(`${API}/api/librarian/${libraryId}/inventory`, authHeader());
export const addInventory = (libraryId, payload) =>
    axios.post(`${API}/api/librarian/${libraryId}/inventory/add`, payload, authHeader());
export const decreaseInventory = (libraryId, bookId, amount) =>
    axios.patch(`${API}/api/librarian/${libraryId}/inventory/${bookId}/decrease`, { amount }, authHeader());
export const listLibraryCatalog = (libraryId) =>
    axios.get(`${API}/api/librarian/${libraryId}/inventory/catalog`, authHeader());
export const setPrice = (libraryId, bookId, price) =>
    axios.patch(`${API}/api/librarian/${libraryId}/inventory/${bookId}/price`, { price }, authHeader());

export const listRequests = (libraryId, status = 'pending') =>
    axios.get(`${API}/api/requests/librarian/${libraryId}/requests`, { ...authHeader(), params: { status } });
export const approveRequest = (libraryId, requestId) =>
    axios.patch(`${API}/api/requests/librarian/${libraryId}/requests/${requestId}/approve`, {}, authHeader());
export const rejectRequest = (libraryId, requestId, note = '') =>
    axios.patch(`${API}/api/requests/librarian/${libraryId}/requests/${requestId}/reject`, { note }, authHeader());

// --- Admin: Librarian applications ---
export const listLibrarianApps = (status = 'pending') =>
    axios.get(`${API}/api/admin/librarian-applications`, {
        ...authHeader(),
        params: { status }
    });

export const decideLibrarianApp = (appId, decision, reviewNote = '') =>
    axios.patch(`${API}/api/admin/librarian-applications/${appId}`, { decision, reviewNote }, authHeader());
