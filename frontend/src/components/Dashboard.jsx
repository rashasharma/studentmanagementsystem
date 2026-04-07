import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ courses: 0, attendance: 'N/A', fees: 'Cleared' });
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch User Profile
        const profileRes = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // 2. Fetch REAL Enrollment Data to calculate stats
        if (profileRes.data.role === 'STUDENT') {
          const enrollRes = await axios.get('http://127.0.0.1:8000/api/academics/enroll/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const enrollments = enrollRes.data;
          const courseCount = enrollments.length;
          
          // Calculate true average attendance
          let totalPercent = 0;
          let validClasses = 0;
          
          enrollments.forEach(enr => {
            if (enr.attendance_percentage && enr.attendance_percentage !== "No classes recorded") {
              totalPercent += parseInt(enr.attendance_percentage.replace('%', ''));
              validClasses += 1;
            }
          });
          
          const avgAtt = validClasses > 0 ? Math.round(totalPercent / validClasses) + '%' : 'N/A';
          
          // Update the state with REAL numbers
          setStats({ courses: courseCount, attendance: avgAtt, fees: 'Cleared' });
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  if (loading) return <div style={{ padding: '40px', color: '#94a3b8', textAlign: 'center' }}>Loading your workspace...</div>;

  return (
    <div className="animate-fade-in">
      {/* Dynamic Header */}
      <div style={{ marginBottom: '40px' }}>
        <h2 className="dashboard-title">{greeting}, {profile?.username || 'Student'}!</h2>
        <p className="dashboard-subtitle">Welcome back to your Meridian student portal.</p>
      </div>

      {/* REAL Interactive Quick Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        {/* Stat Card 1: Live Course Count */}
        <div className="modern-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📚</div>
          <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Active Courses</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc' }}>{stats.courses}</p>
        </div>

        {/* Stat Card 2: Live Attendance Average */}
        <div className="modern-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #f43f5e' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎯</div>
          <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Avg Attendance</h4>
          <p style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: stats.attendance === 'N/A' ? '#94a3b8' : '#4ade80' 
          }}>
            {stats.attendance}
          </p>
        </div>

        {/* Stat Card 3: Fee Status */}
        <div className="modern-card" style={{ padding: '20px', textAlign: 'center', borderTop: '4px solid #a855f7' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💳</div>
          <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase' }}>Fee Status</h4>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', marginTop: '10px' }}>{stats.fees}</p>
        </div>
      </div>

      {/* Personal Information Section */}
      <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: '#e2e8f0' }}>Personal Information</h3>
      <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="modern-table" style={{ margin: '0' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', fontWeight: 'bold', color: '#94a3b8', paddingLeft: '25px' }}>Student ID / Username</td>
              <td style={{ color: '#f8fafc', fontWeight: '500' }}>@{profile?.username}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', color: '#94a3b8', paddingLeft: '25px' }}>Account Role</td>
              <td>
                <span style={{ 
                  background: 'rgba(56, 189, 248, 0.1)', 
                  color: '#38bdf8', 
                  padding: '5px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  {profile?.role}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', color: '#94a3b8', paddingLeft: '25px' }}>Academic Status</td>
              <td style={{ color: stats.courses > 0 ? '#4ade80' : '#f59e0b', fontWeight: 'bold' }}>
                {stats.courses > 0 ? 'Active / Enrolled' : 'Not Enrolled'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}