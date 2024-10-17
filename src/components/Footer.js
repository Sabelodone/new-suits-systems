import React from 'react';
import './Footer.css';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = ({ companyName, address, email, phone }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer bg-light text-center py-4 mt-auto shadow-sm">
      <div className="container">
        <p className="footer-company">&copy; {currentYear} {companyName}. All rights reserved.</p>
        <p className="footer-address">{address}</p>
        <p className="footer-contact">
          <a href={`mailto:${email}`} className="footer-link">{email}</a> | 
          <a href={`tel:${phone}`} className="footer-link">{phone}</a>
        </p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebook className="icon" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter className="icon" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin className="icon" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
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
  companyName: 'Your Software Company',
  address: '1234 Software Blvd, Tech City, TC 56789',
  email: 'support@yoursoftware.com',
  phone: '(123) 456-7890',
};

export default Footer;
