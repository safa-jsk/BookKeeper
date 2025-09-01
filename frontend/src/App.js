import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import Hakla from './pages/Hakla';
import Trending from './pages/Trending';
import Login from './pages/Login';
import Register from './pages/Register';
import AccountSettings from './pages/AccountSettings';
import Cart from './pages/Cart';
import Map from './pages/Map';

import DashboardLayout from './pages/dashboard/Layout';
import DashboardHome from './pages/dashboard/Home';
import WantToRead from './pages/dashboard/WantToRead';
import Finished from './pages/dashboard/Finished';
import CurrentlyReading from './pages/dashboard/CurrentlyReading';
import Favorites from './pages/dashboard/Favorites';

import LibrarianInventory from './pages/librarian/Inventory';
import LibrarianRequests from './pages/librarian/Requests';
import LibrarianHomeResolver from './pages/librarian/HomeResolver';

import AdminLayout from './pages/admin/Layout';
import AdminHome from './pages/admin/Home';
import AdminLibrarianApplications from './pages/admin/LibrarianApplications';
import AdminRequests from './pages/admin/Requests';
import BooksAdmin from './pages/admin/Books';
import InventoryAdmin from './pages/admin/Inventory';
import UsersAdmin from './pages/admin/Users';
import LibrariesAdmin from './pages/admin/Libraries';

import './styles/styles.css';
import { ThemeProvider } from '@mui/material/styles';
import baseTheme, { buildTheme, THEMES } from './theme';
import { CssBaseline } from '@mui/material';

function App() {
  const [user, setUser] = useState(null);
  const [activeTheme, setActiveTheme] = useState(baseTheme);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        const key = u?.theme || 'scholarly';
        const palette = THEMES[key] || THEMES.scholarly;
        setActiveTheme(buildTheme(palette));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  // Listen for theme updates without full reload
  useEffect(() => {
    const onThemeUpdated = () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const key = savedUser?.theme || 'scholarly';
        const palette = THEMES[key] || THEMES.scholarly;
        setActiveTheme(buildTheme(palette));
      } catch { }
    };
    window.addEventListener('user-theme-updated', onThemeUpdated);
    return () => window.removeEventListener('user-theme-updated', onThemeUpdated);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    try {
      sessionStorage.setItem('navigating', '1');
      window.location.assign('/');
    } catch { }
  };

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    const key = userObj?.theme || 'scholarly';
    const palette = THEMES[key] || THEMES.scholarly;
    setActiveTheme(buildTheme(palette));
    if (userObj.role === 'librarian') {
      localStorage.setItem('libraryId', userObj.libraryId);
    }
    // Navigate to role home (safe outside Router context)
    try {
      sessionStorage.setItem('navigating', '1');
      window.location.assign(userObj.role === 'admin' ? '/admin' : '/dashboard');
    } catch { }
  };

  const handleRegister = (message) => {
    // optional: you can show a toast or alert here
    console.log(message || "Registration successful");

    // clear any auth data just in case
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // redirect to login page
    try {
      sessionStorage.setItem("navigating", "1");
      Navigate("/");
    } catch {
      window.location.assign("/");
    }
  };

  // Clear navigating flag on load (for SPA navigation tracking)
  useEffect(() => {
    try {
      sessionStorage.removeItem('navigating');
    } catch { }
  }, []);

  // Route wrappers
  const InventoryRoute = () => {
    const { libraryId } = useParams();
    return <LibrarianInventory libraryId={libraryId} />;
  };

  const RequestsRoute = () => {
    const { libraryId } = useParams();
    return <LibrarianRequests libraryId={libraryId} />;
  };

  // Optional: client-side role guard (server still enforces)
  const RequireRole = ({ roles, children, user }) => {
    const token = localStorage.getItem('token');
    if (!token || !user) return <Navigate to="/" replace />;
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <Router>
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home onLogin={handleLogin} onRegister={handleRegister} user={user} />} />
          <Route path="/browse" element={<BookList />} />
          <Route path="/hakla" element={<Hakla />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/map" element={<Map />} />

          {/* Reader/Librarian dashboard */}
          <Route path="/dashboard/*" element={<DashboardLayout user={user} />}>
            <Route index element={<DashboardHome user={user} />} />
            <Route path="want-to-read" element={<WantToRead user={user} />} />
            <Route path="finished" element={<Finished user={user} />} />
            <Route path="currently-reading" element={<CurrentlyReading user={user} />} />
            <Route path="favorites" element={<Favorites user={user} />} />
            <Route path="account-settings" element={<AccountSettings user={user} onLogout={handleLogout} />} />

            <Route path="librarian" element={<RequireRole roles={['librarian', 'admin']} user={user}><LibrarianHomeResolver /></RequireRole>} />
            <Route path="librarian/:libraryId/inventory" element={<RequireRole roles={['librarian', 'admin']} user={user}><InventoryRoute /></RequireRole>} />
            <Route path="librarian/:libraryId/requests" element={<RequireRole roles={['librarian', 'admin']} user={user}><RequestsRoute /></RequireRole>} />
          </Route>

          {/* Admin panel */}
          <Route path="/admin/*" element={<RequireRole roles={['admin']} user={user}><AdminLayout user={user} /></RequireRole>}>
            <Route index element={<AdminHome />} />
            <Route path="librarian-applications" element={<AdminLibrarianApplications />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="books" element={<BooksAdmin />} />
            <Route path="inventory" element={<InventoryAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="libraries" element={<LibrariesAdmin />} />
            <Route path="account-settings" element={<AccountSettings user={user} onLogout={handleLogout} />} />
          </Route>

          <Route path="/cart" element={<Cart />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
