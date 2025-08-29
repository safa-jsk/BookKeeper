import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import Hakla from './pages/Hakla';
import Trending from './pages/Trending';
import AISearch from './pages/AISearch';
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
import AdminLibrarianApplications from './pages/admin/LibrarianApplications';
import BooksAdmin from './pages/admin/Books';
import InventoryAdmin from './pages/admin/Inventory';
import UsersAdmin from './pages/admin/Users';
import LibrariesAdmin from './pages/admin/Libraries';

import './styles/styles.css';

function App() {
  const [user, setUser] = useState(null);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    try { window.location.assign('/'); } catch { }
  };

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    if (userObj.role === 'librarian') {
      localStorage.setItem('libraryId', userObj.libraryId);
    }
    // Navigate to role home (safe outside Router context)
    try { window.location.assign(userObj.role === 'admin' ? '/admin' : '/dashboard'); } catch { }
  };


  // Logout when the last open tab/window of this site is closed
  useEffect(() => {
    try {
      const current = Number(localStorage.getItem('openTabs') || '0');
      localStorage.setItem('openTabs', String(current + 1));
    } catch { }

    const onBeforeUnload = () => {
      try {
        const current = Number(localStorage.getItem('openTabs') || '0');
        const remaining = Math.max(0, current - 1);
        localStorage.setItem('openTabs', String(remaining));
        if (remaining === 0) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch { }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
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
    if (!token || !user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home onLogin={handleLogin} user={user} />} />
        <Route path="/browse" element={<BookList />} />
        <Route path="/hakla" element={<Hakla />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/ai-search" element={<AISearch />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
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
        <Route
          path="/admin"
          element={<RequireRole roles={['admin']} user={user}><AdminLayout /></RequireRole>}
        >
          <Route index element={<Navigate to="/admin/librarian-applications" replace />} />
          <Route path="librarian-applications" element={<AdminLibrarianApplications />} />
          <Route path="books" element={<BooksAdmin />} />
          <Route path="inventory" element={<InventoryAdmin />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="libraries" element={<LibrariesAdmin />} />
        </Route>

        <Route path="/cart" element={<Cart />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
