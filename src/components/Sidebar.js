// Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, Col } from 'react-bootstrap'; // Importing Col here
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faBriefcase, faTasks, faClock, faUsers, faFileAlt, faMoneyBill, faCog } from '@fortawesome/free-solid-svg-icons'; // Import the new icon
import './Sidebar.css'; // Sidebar styles

const Sidebar = () => {
  return (
    <Col md={2} className="sidebar d-flex flex-column justify-content-between p-3">
      <Nav className="flex-column">
        {/* Sidebar Links */}
        {[
          { to: "/dashboard", icon: faHome, label: "Dashboard" },
          { to: "/cases", icon: faBriefcase, label: "Cases" },
          { to: "/tasks", icon: faTasks, label: "Tasks" },
          { to: "/time-management", icon: faClock, label: "Schedular" },
          { to: "/clients", icon: faUsers, label: "Clients" },
          { to: "/document-management", icon: faFileAlt, label: "Documents" },
          { to: "/legal-templates", icon: faFileAlt, label: "Templates" },
          { to: "/invoice-and-billing", icon: faMoneyBill, label: "Invoice and Billing" }, // New link for Invoice and Billing
          { to: "/settings", icon: faCog, label: "Settings" }, // New link for Settings
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link text-sm   ${isActive ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={icon} className="me-2" /> {label}
          </NavLink>
        ))}
      </Nav>
    </Col>
  );
};

export default Sidebar;
