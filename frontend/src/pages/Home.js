import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4 fw-bold">Welcome to BookKeeper</h1>
      <p className="lead mt-4">
        Discover, rate, and organize books. Get personalized recommendations, find trending reads, and locate nearby bookstores—all in one place!
      </p>
      <div className="mt-4">
        <Link to="/browse" className="btn btn-primary btn-lg me-2">
          Browse Books
        </Link>
        <Link to="/trending" className="btn btn-outline-primary btn-lg">
          Trending
        </Link>
      </div>
    </div>
  );
}

export default Home;
