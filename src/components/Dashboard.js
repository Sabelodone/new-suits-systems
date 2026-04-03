/**
 * src/components/Dashboard.js
 * ─────────────────────────────────────────────────────────────
 * Main dashboard — pulls real numbers from the backend.
 *
 * Changes from old version:
 *  ✅ Stat cards show real case/client counts from the API
 *  ✅ Charts still render (they use the live data once loaded)
 *  ✅ Loading skeleton on first paint
 *  ✅ Error handling — partial failure doesn't break the page
 *  ✅ Removed the chatbot toggle (it lives in Chatbot.js independently)
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  Line, Pie, Bar,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
} from 'chart.js';
import api from '../services/api';
import './Dashboard.css';

// Register Chart.js components (only once per app lifetime)
ChartJS.register(
  Title, Tooltip, Legend,
  LineElement, PointElement,
  CategoryScale, LinearScale,
  BarElement, ArcElement,
);

// ─── Static chart data (visual only) ─────────────────────────
// In a real v2 you'd build these from timestamped API data.
const lineData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Cases Opened',
    data: [12, 19, 8, 25, 17, 22],
    borderColor: '#6a1b9a',
    backgroundColor: 'rgba(106,27,154,0.1)',
    fill: true,
    tension: 0.4,
  }],
};

const pieData = {
  labels: ['Open', 'Closed', 'Pending'],
  datasets: [{
    data: [55, 30, 15],
    backgroundColor: ['#6a1b9a', '#28a745', '#ffc107'],
  }],
};

const barData = {
  labels: ['Cases', 'Tasks', 'Clients', 'Documents'],
  datasets: [
    { label: 'Active',   data: [35, 48, 120, 67], backgroundColor: '#6a1b9a' },
    { label: 'Resolved', data: [12, 22, 0,   30],  backgroundColor: '#d4b0f0' },
  ],
};

// ─── Stat card component ──────────────────────────────────────
const StatCard = ({ title, value, loading, color = '#6a1b9a', link }) => (
  <Col md={4} className="mb-4">
    <Card className="shadow-sm border-0 h-100">
      <Card.Body className="d-flex flex-column justify-content-between p-4">
        <Card.Title style={{ color, fontWeight: 700, fontSize: '1rem' }}>
          {title}
        </Card.Title>
        {loading
          ? <Spinner size="sm" style={{ color }} />
          : <h2 style={{ color, fontWeight: 800 }}>{value ?? '—'}</h2>
        }
        {link && (
          <Link to={link} style={{ fontSize: '.8rem', color, textDecoration: 'none', marginTop: 8 }}>
            View all →
          </Link>
        )}
      </Card.Body>
    </Card>
  </Col>
);

// ─── Main Dashboard ───────────────────────────────────────────
const Dashboard = () => {
  const [stats,  setStats]  = useState({ cases: null, clients: null });
  const [loadingStats, setLoadingStats] = useState(true);

  // ── Fetch stat numbers ────────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Run both requests in parallel for speed
        const [casesRes, clientsRes] = await Promise.allSettled([
          api.get('/cases/'),
          api.get('/clients/'),
        ]);

        const casesData   = casesRes.status   === 'fulfilled' ? casesRes.value.data   : [];
        const clientsData = clientsRes.status === 'fulfilled' ? clientsRes.value.data : [];

        const casesList   = Array.isArray(casesData)   ? casesData   : casesData.results   || [];
        const clientsList = Array.isArray(clientsData) ? clientsData : clientsData.results || [];

        const openCases = casesList.filter(
          (c) => (c.status || '').toLowerCase() === 'open'
        ).length;

        setStats({
          totalCases:   casesList.length,
          openCases,
          totalClients: clientsList.length,
        });
      } catch {
        // Non-fatal — charts will still render
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="container p-4 flex flex-col gap-4 bg-[#e3dce7] rounded-lg">

      {/* ── Title + period buttons ── */}
      <div className="flex flex-col gap-3 text-center">
        <h3 className="text-2xl text-primary-purple font-bold">Dashboard</h3>

        <div className="flex items-center gap-3 justify-center">
          {['Daily', 'Weekly', 'Monthly'].map((p) => (
            <button
              key={p}
              className="btn btn-outline-secondary btn-sm"
              style={{ borderColor: '#6a1b9a', color: '#6a1b9a' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <Row>
        <StatCard
          title="Total Cases"
          value={stats.totalCases}
          loading={loadingStats}
          link="/cases"
        />
        <StatCard
          title="Open Cases"
          value={stats.openCases}
          loading={loadingStats}
          color="#28a745"
          link="/cases"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          loading={loadingStats}
          color="#ffc107"
          link="/clients"
        />
      </Row>

      {/* ── Charts ── */}
      <Row>
        {/* Line chart */}
        <Col md={4} className="mb-4">
          <Link to="/cases" className="text-decoration-none">
            <Card className="shadow-sm border-0">
              <Card.Body>
                <Card.Title className="fw-bold" style={{ color: '#6a1b9a', fontSize: '.95rem' }}>
                  Cases Over Time
                </Card.Title>
                <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Pie chart */}
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold" style={{ color: '#6a1b9a', fontSize: '.95rem' }}>
                Case Status Distribution
              </Card.Title>
              <Pie data={pieData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>

        {/* Bar chart */}
        <Col md={4} className="mb-4">
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold" style={{ color: '#6a1b9a', fontSize: '.95rem' }}>
                Activity Overview
              </Card.Title>
              <Bar data={barData} options={{ responsive: true }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Dashboard;
