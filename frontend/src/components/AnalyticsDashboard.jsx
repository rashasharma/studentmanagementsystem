import { useState, useEffect } from 'react';
import axios from 'axios';

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

  if (loading) return <div style={{ padding: '20px' }}>Loading system analytics...</div>;
  if (!stats) return <div style={{ padding: '20px', color: 'red' }}>Failed to load data.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '5px' }}>System Analytics</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>Real-time overview of the EduCore database.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* Metric Card 1 */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Students</h3>
          <p style={cardNumberStyle}>{stats.total_students}</p>
        </div>

        {/* Metric Card 2 */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Active Courses</h3>
          <p style={cardNumberStyle}>{stats.total_courses}</p>
        </div>

        {/* Metric Card 3 */}
        <div style={cardStyle}>
          <h3 style={cardTitleStyle}>Total Enrollments</h3>
          <p style={cardNumberStyle}>{stats.total_enrollments}</p>
        </div>

        {/* Metric Card 4 */}
        <div style={{ ...cardStyle, backgroundColor: '#1a1a2e', color: 'white' }}>
          <h3 style={{ ...cardTitleStyle, color: '#aaa' }}>Most Popular Course</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{stats.popular_course}</p>
        </div>

      </div>
    </div>
  );
}

// Simple styling objects to keep the JSX clean
const cardStyle = {
  padding: '20px',
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  textAlign: 'center'
};

const cardTitleStyle = {
  margin: '0 0 10px 0',
  fontSize: '1rem',
  color: '#555',
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const cardNumberStyle = {
  margin: 0,
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#007bff'
};