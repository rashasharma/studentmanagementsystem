import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Transcript({ token }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        // We use the exact same endpoint we built for course registration!
        const response = await axios.get('http://127.0.0.1:8000/api/academics/enroll/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrollments(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch transcript", err);
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [token]);

  if (loading) return <div>Loading your academic record...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>My Official Transcript</h2>
      <p style={{ color: '#555', marginBottom: '20px' }}>
        Review your enrolled courses and current grades below.
      </p>

      <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f4f4f4' }}>
            <tr>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Course Code</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Course Name</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Enrollment Date</th>
              <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Official Grade</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}><strong>{enrollment.course_code}</strong></td>
                <td style={{ padding: '15px' }}>{enrollment.course_name}</td>
                <td style={{ padding: '15px' }}>{enrollment.enrollment_date}</td>
                <td style={{ padding: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: enrollment.grade ? '#28a745' : '#6c757d' }}>
                  {enrollment.grade || 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {enrollments.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            You are not currently enrolled in any courses.
          </div>
        )}
      </div>
    </div>
  );
}