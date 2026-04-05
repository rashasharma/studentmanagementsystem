import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard({ token }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs automatically as soon as the Dashboard loads
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/student/profile/', {
          // Here is the magic: we attach the JWT token to the request!
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Save the Django data into our React state
        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data. Your token might be expired.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProfile();
  }, [token]); // The array here means "run this whenever the token changes"

  // What to show while we wait for Django to respond
  if (loading) return <div>Loading your dashboard...</div>;
  
  // What to show if Django rejects the request
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // What to show when we successfully get the data!
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
        Welcome, {profile.username}!
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
        <div>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Role:</strong></p>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>{profile.role}</p>
        </div>
        
        <div>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Program:</strong></p>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>{profile.program || 'Not assigned'}</p>
        </div>

        <div>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Email:</strong></p>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>{profile.email}</p>
        </div>

        <div>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Contact Number:</strong></p>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>{profile.contact_number || 'Not provided'}</p>
        </div>

        <div>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Enrollment Date:</strong></p>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>{profile.enrollment_date}</p>
        </div>

        <div>
          <p style={{ margin: '5px 0', color: '#555' }}><strong>Account Status:</strong></p>
          <p style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: profile.is_active ? 'green' : 'red' }}>
            {profile.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </div>
  );
}