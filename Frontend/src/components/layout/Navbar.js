import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user, logout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-leaf mr-2"></i>
          Stubble Management
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
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
              </>
            ) : (
              <>
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
              </>
            )}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          transition: all 0.3s ease;
          padding: 1rem 0;
          background-color: #036A48;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .navbar-brand {
          font-size: 1.5rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #ffffff;
        }
        .nav-link {
          transition: all 0.3s ease;
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          border-radius: 4px;
          color: #ffffff;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
          color: #ffffff;
        }
        .navbar-toggler {
          border: none;
        }
        .navbar-toggler:focus {
          outline: none;
          box-shadow: none;
        }
        @media (max-width: 991.98px) {
          .navbar-collapse {
            background-color: #036A48;
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
          }
          .nav-link {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
