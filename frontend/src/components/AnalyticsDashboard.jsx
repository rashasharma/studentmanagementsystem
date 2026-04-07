import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css'; // Pull in the global dark theme!

export default function AnalyticsDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/academics/analytics/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div style={{ padding: '20px', color: '#aaaaaa' }}>Loading system analytics...</div>;
  if (!stats) return <div style={{ padding: '20px', color: '#ff6b6b' }}>Failed to load data.</div>;

  return (
    <div>
      <h2 className="dashboard-title">System Analytics</h2>
      <p className="dashboard-subtitle">Real-time overview of the EduCore database.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px', marginTop: '20px' }}>
        
        {/* Metric Card 1 */}
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Total Students</h3>
          <p style={statNumberStyle}>{stats.total_students}</p>
        </div>

        {/* Metric Card 2 */}
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Active Courses</h3>
          <p style={statNumberStyle}>{stats.total_courses}</p>
        </div>

        {/* Metric Card 3 */}
        <div style={statCardStyle}>
          <h3 style={statTitleStyle}>Total Enrollments</h3>
          <p style={statNumberStyle}>{stats.total_enrollments}</p>
        </div>

        {/* Metric Card 4 - Highlighted with the Theme Gradient */}
        <div style={{ ...statCardStyle, background: 'linear-gradient(135deg, #ff3333 0%, #a00000 100%)', borderColor: '#ff4d4d' }}>
          <h3 style={{ ...statTitleStyle, color: '#ffcccc' }}>Most Popular Course</h3>
          <p style={{ ...statNumberStyle, fontSize: '1.8rem', paddingTop: '10px' }}>{stats.popular_course}</p>
        </div>

      </div>
    </div>
  );
}

// Sleek dark-mode inline styles for the stat widgets
const statCardStyle = {
  padding: '30px 20px',
  backgroundColor: '#222222',
  border: '1px solid #333333',
  borderRadius: '15px',
  boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '160px',
  transition: 'transform 0.2s'
};

const statTitleStyle = {
  margin: '0 0 10px 0',
  fontSize: '0.9rem',
  color: '#888888',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  fontWeight: '600'
};

const statNumberStyle = {
  margin: 0,
  fontSize: '3.5rem',
  fontWeight: 'bold',
  color: '#ffffff'
};