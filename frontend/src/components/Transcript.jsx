import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function Transcript({ token }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false); // To show a loading state on the button

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
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

  // --- NEW PDF DOWNLOAD FUNCTION ---
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/academics/transcript/download/', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob', // CRITICAL: Tells Axios we are expecting a file, not JSON!
      });
      
      // Create a temporary link in the browser to trigger the file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Official_Transcript.pdf'); // The name of the file
      document.body.appendChild(link);
      link.click();
      
      // Clean up the temporary link
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to generate PDF. Please try again.");
    }
    setDownloading(false);
  };

  if (loading) return <div style={{ padding: '20px', color: '#aaa' }}>Loading your academic record...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-title">My Official Transcript</h2>
          <p className="dashboard-subtitle">Review your enrolled courses and current grades below.</p>
        </div>
        
        {/* NEW DOWNLOAD BUTTON */}
        <button 
          onClick={handleDownloadPDF} 
          disabled={downloading || enrollments.length === 0}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ff3333',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: downloading ? 'wait' : 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: enrollments.length === 0 ? 0.5 : 1,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => { if(!downloading) e.target.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { if(!downloading) e.target.style.transform = 'translateY(0px)' }}
        >
          {downloading ? 'Generating PDF...' : '📄 Download PDF'}
        </button>
      </div>

      <div className="roster-container">
        <h3 className="section-title" style={{ border: 'none', marginBottom: '5px' }}>Academic Record</h3>
        
        <table className="modern-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Enrollment Date</th>
              <th>Official Grade</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td style={{ fontWeight: 'bold', color: '#ffffff' }}>{enrollment.course_code}</td>
                <td style={{ color: '#aaaaaa' }}>{enrollment.course_name}</td>
                <td style={{ color: '#888888' }}>{enrollment.enrollment_date}</td>
                <td style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: enrollment.grade ? '#4ade80' : '#888888' 
                }}>
                  {enrollment.grade || 'Pending'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {enrollments.length === 0 && (
          <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
            You are not currently enrolled in any courses.
          </p>
        )}
      </div>
    </div>
  );
}