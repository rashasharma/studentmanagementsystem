import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css'; // Pull in the global dark theme!

export default function Dashboard({ token }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Adjust this URL to match your exact profile endpoint!
        const response = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load profile data.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return <div style={{ padding: '20px', color: '#aaaaaa' }}>Loading profile...</div>;
  if (error) return <div style={{ padding: '20px', color: '#ff6b6b' }}>{error}</div>;
  if (!profile) return null;

  return (
    <div>
      <h2 className="dashboard-title">Welcome, {profile.username}!</h2>
      <p className="dashboard-subtitle">Here is your official student profile.</p>

      {/* Using the dark theme container instead of a white background */}
      <div className="roster-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        <div>
          <p style={{ color: '#888888', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Role</p>
          <p style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>{profile.role || 'STUDENT'}</p>
        </div>

        <div>
          <p style={{ color: '#888888', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Program</p>
          <p style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>{profile.program || 'BTECH CSE'}</p>
        </div>

        <div>
          <p style={{ color: '#888888', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Email</p>
          <p style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>{profile.email}</p>
        </div>

        <div>
          <p style={{ color: '#888888', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Contact Number</p>
          <p style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>{profile.contact_number || 'Not provided'}</p>
        </div>

        <div>
          <p style={{ color: '#888888', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Enrollment Date</p>
          <p style={{ color: '#ffffff', margin: 0, fontSize: '1.1rem' }}>{profile.enrollment_date || '2026-04-05'}</p>
        </div>

        <div>
          <p style={{ color: '#888888', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Account Status</p>
          <p style={{ color: '#4ade80', margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Active</p>
        </div>

      </div>
    </div>
  );
}