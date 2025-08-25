import axios from 'axios';

export const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

// one axios instance for everything
const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

// attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ------- AUTH -------
export const auth = {
    register: (payload) => api.post('/auth/register', payload),
    login: (payload) => api.post('/auth/login', payload),
};

// ------- BOOKS -------
export const books = {
    search: (query, filter = 'none') => api.get('/books/search', { params: { query, filter } }),
    list: () => api.get('/books'),
    getOne: (id) => api.get(`/books/${id}`),
    getReviews: (id) => api.get(`/books/${id}/reviews`),
    addReview: (id, { user, rating, comment }) => api.post(`/books/${id}/reviews`, { user, rating, comment }),
};

// ------- CART -------
export const cart = {
    get: () => api.get('/cart'),
    addOrUpdateItem: (bookId, quantity = 1) => api.post('/cart/items', { bookId, quantity }),
    removeItem: (bookId) => api.delete(`/cart/items/${bookId}`),
};

// ------- REQUESTS (user + librarian) -------
export const requests = {
    create: (libraryId, items) => api.post('/requests', { libraryId, items }),
    listForLibrary: (libraryId, status = 'pending') =>
        api.get(`/requests/librarian/${libraryId}/requests`, { params: { status } }),
    approve: (libraryId, requestId) =>
        api.patch(`/requests/librarian/${libraryId}/requests/${requestId}/approve`),
    reject: (libraryId, requestId, note = '') =>
        api.patch(`/requests/librarian/${libraryId}/requests/${requestId}/reject`, { note }),
};

// ------- LIBRARIAN (applications + my-library) -------
export const librarian = {
    myApplication: () => api.get('/librarian/my-application'),
    cities: () => api.get('/librarian/cities'),
    checkPhone: (phone) => api.get('/librarian/check-phone', { params: { phone } }),
    apply: (payload) => api.post('/librarian/apply', payload),
    myLibrary: () => api.get('/librarian/my-library'),
};

// ------- INVENTORY (librarian) -------
export const inventory = {
    list: (libraryId) => api.get(`/librarian/${libraryId}/inventory`),
    catalog: (libraryId) => api.get(`/librarian/${libraryId}/inventory/catalog`),
    addOrIncrease: (libraryId, payload) => api.post(`/librarian/${libraryId}/inventory/add`, payload),
    decrease: (libraryId, bookId, amount) =>
        api.patch(`/librarian/${libraryId}/inventory/${bookId}/decrease`, { amount }),

    // note: setPrice backend endpoint does not exist yet. If you add it, wire here:
    setPrice: (libraryId, bookId, price) =>
        api.patch(`/librarian/${libraryId}/inventory/${bookId}/price`, { price }),
};

// ------- DASHBOARD -------
export const dashboard = {
    overview: () => api.get('/dashboard'),
    wantToRead: () => api.get('/dashboard/want-to-read'),
    currentlyReading: () => api.get('/dashboard/currently-reading'),
    finished: () => api.get('/dashboard/finished'),
    favorites: () => api.get('/dashboard/favorites'),
    finishBook: (bookId) => api.patch(`/dashboard/users/me/reading/${bookId}/finish`),
};

// ------- USER -------
export const me = {
    get: () => api.get('/user/me'),
    update: (payload) => api.put('/user/me', payload),
    changePassword: (currentPassword, newPassword) =>
        api.patch('/user/me/password', { currentPassword, newPassword }),
    uploadAvatar: (file) => {
        const form = new FormData();
        form.append('avatar', file);
        return api.post('/user/me/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    delete: () => api.delete('/user/me'),
    addBookToCategory: (bookId, category) => api.post(`/user/books/${bookId}/add-to-category`, { category }),
    removeBookFromCategory: (bookId, category) => api.post(`/user/books/${bookId}/remove-from-category`, { category }),
};

// ------- ADMIN -------
export const admin = {
    listLibrarianApps: (status = 'pending') => api.get('/admin/librarian-applications', { params: { status } }),
    decideLibrarianApp: (id, decision, reviewNote = '') =>
        api.patch(`/admin/librarian-applications/${id}`, { decision, reviewNote }),
};

// convenience re-exports for legacy imports
export const API = API_BASE;
export const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// legacy-shaped helpers so existing components keep working without refactors
export const getCart = () => cart.get();
export const addCartItem = (bookId, quantity = 1) => cart.addOrUpdateItem(bookId, quantity);
export const removeCartItem = (bookId) => cart.removeItem(bookId);

export const createRequest = (libraryId, items) => requests.create(libraryId, items);

export const listLibraryInventory = (libraryId) => inventory.list(libraryId);
export const addInventory = (libraryId, payload) => inventory.addOrIncrease(libraryId, payload);
export const decreaseInventory = (libraryId, bookId, amount) => inventory.decrease(libraryId, bookId, amount);
export const listLibraryCatalog = (libraryId) => inventory.catalog(libraryId);

// this one works only if you implement the backend route (see note below)
export const setPrice = (libraryId, bookId, price) => inventory.setPrice(libraryId, bookId, price);
