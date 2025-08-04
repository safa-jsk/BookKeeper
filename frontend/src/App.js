import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookList from './components/BookList';
import BookDetail from './components/BookDetail';
import Trending from './pages/Trending';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/styles.css';

function App() {
  const [user, setUser] = useState(null);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Log out function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update: after login/register, save user to both state and localStorage
  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home onLogin={handleLogin} />} />
        <Route path="/browse" element={<BookList />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onRegister={handleLogin} />} />
      </Routes>
    </Router>
  );
}

export default App;
