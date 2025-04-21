import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Stubble Management</h3>
            <p>Transforming agricultural waste into valuable resources for a sustainable future.</p>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li><i className="fas fa-map-marker-alt"></i> 123 Green Street, Farm City</li>
              <li><i className="fas fa-phone"></i> +1 234 567 890</li>
              <li><i className="fas fa-envelope"></i> info@stubblemanagement.com</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Stubble Management. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background-color: #036A48;
          color: #ffffff;
          padding: 4rem 0 2rem;
          margin-top: 4rem;
        }
        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        .footer-section h3 {
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: #ffffff;
        }
        .footer-section p {
          font-family: 'Poppins', sans-serif;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
        }
        .social-links {
          display: flex;
          gap: 1rem;
        }
        .social-link {
          color: #ffffff;
          font-size: 1.25rem;
          transition: all 0.3s ease;
        }
        .social-link:hover {
          color: rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
        }
        .footer-links {
          list-style: none;
          padding: 0;
        }
        .footer-links li {
          margin-bottom: 0.75rem;
        }
        .footer-links a {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .footer-links a:hover {
          color: #ffffff;
          padding-left: 5px;
        }
        .contact-info {
          list-style: none;
          padding: 0;
        }
        .contact-info li {
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .contact-info i {
          color: #ffffff;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer-bottom p {
          margin: 0;
          font-family: 'Poppins', sans-serif;
          color: rgba(255, 255, 255, 0.8);
        }
        @media (max-width: 768px) {
          .footer {
            padding: 3rem 0 1.5rem;
          }
          .footer-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer; 