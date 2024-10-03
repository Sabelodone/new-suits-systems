import React from 'react';
import './Footer.css';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = ({ companyName, address, email, phone }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-light text-center py-4 mt-auto shadow-sm">
      <div className="container">
        <p className="mb-1">&copy; {currentYear} {companyName}. All rights reserved.</p>
        <p className="mb-1">{address}</p>
        <p className="mb-1">
          <a href={`mailto:${email}`} className="footer-link">{email}</a> | 
          <a href={`tel:${phone}`} className="footer-link">{phone}</a>
        </p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook className="icon" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="icon" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="icon" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="icon" />
          </a>
        </div>
        <div className="quick-links">
          <a href="/privacy-policy" className="footer-link">Privacy Policy</a>
          <span className="mx-1">|</span>
          <a href="/terms-of-service" className="footer-link">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

// Default props for fallback
Footer.defaultProps = {
  companyName: 'Your Company',
  address: '1234 Legal St, Lawtown, LT 56789',
  email: 'info@yourcompany.com',
  phone: '(123) 456-7890',
};

export default Footer;
