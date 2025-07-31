import React, { useState } from 'react';
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

  // Log out function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BookList />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register onRegister={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
