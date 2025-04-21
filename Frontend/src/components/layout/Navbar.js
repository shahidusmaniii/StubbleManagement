import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
  const authLinks = (
    <ul className="navbar-nav ml-auto">
      {user && user.type === 'Farmer' && (
        <li className="nav-item">
          <Link className="nav-link" to="/service">
            Request Service
          </Link>
        </li>
      )}
      <li className="nav-item">
        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <a onClick={logout} href="#!" className="nav-link">
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav ml-auto">
      <li className="nav-item">
        <Link className="nav-link" to="/register">
          Register
        </Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" to="/login">
          Login
        </Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success navbar-custom mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-leaf mr-2"></i>
          Stubble Management
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
          </ul>
          {user ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 