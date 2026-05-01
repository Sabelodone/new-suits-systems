// Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBriefcase,
  faTasks,
  faClock,
  faUsers,
  faFileAlt,
  faMoneyBill,
  faCog
} from '@fortawesome/free-solid-svg-icons';

import './Sidebar.css';
import { useUser } from './UserContext'; // ✅ ADDED (alignment only)

const Sidebar = () => {
  const { user } = useUser(); // ✅ tenant + role context

  return (
    <Col md={2} className="sidebar d-flex flex-column justify-content-between p-3">

      {/* ── TOP SECTION ───────────────────────────── */}
      <div>

        {/* Optional: Tenant Display (NEW UI ALIGNMENT) */}
        {user?.tenantCode && (
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#6a1b9a',
            padding: '6px 10px',
            background: '#f3e8ff',
            borderRadius: '8px'
          }}>
            Firm: {user.tenantCode}
          </div>
        )}

        <Nav className="flex-column">

          {[
            { to: "/dashboard", icon: faHome, label: "Dashboard" },
            { to: "/cases", icon: faBriefcase, label: "Cases" },
            { to: "/tasks", icon: faTasks, label: "Tasks" },
            { to: "/time-management", icon: faClock, label: "Schedular" },
            { to: "/clients", icon: faUsers, label: "Clients" },
            { to: "/document-management", icon: faFileAlt, label: "Documents" },
            { to: "/legal-templates", icon: faFileAlt, label: "Templates" },
            { to: "/invoice-and-billing", icon: faMoneyBill, label: "Invoice and Billing" },
            { to: "/settings", icon: faCog, label: "Settings" },
          ].map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-link text-sm ${isActive ? 'active' : ''}`
              }
            >
              <FontAwesomeIcon icon={icon} className="me-2" />
              {label}
            </NavLink>
          ))}

        </Nav>
      </div>

      {/* ── BOTTOM SECTION (future RBAC / user info) ───────────────────── */}
      <div style={{ fontSize: '11px', opacity: 0.6 }}>
        {user?.username && (
          <div>Logged in as: {user.username}</div>
        )}
        {user?.role && (
          <div>Role: {user.role}</div>
        )}
      </div>

    </Col>
  );
};

export default Sidebar;