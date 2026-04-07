import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css'; // Using our global dark theme

export default function AttendanceSheet({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Default to today's date in YYYY-MM-DD format
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Fetch the professor's assigned courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/academics/faculty/courses/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (err) {
        console.error("Failed to fetch faculty courses", err);
      }
    };
    fetchCourses();
  }, [token]);

  // 2. Fetch the specific attendance sheet when a course or date is selected
  useEffect(() => {
    if (selectedCourse && date) {
      const fetchAttendance = async () => {
        setLoading(true);
        setMessage('');
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/academics/faculty/courses/${selectedCourse}/attendance/${date}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAttendanceData(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch attendance sheet", err);
          setAttendanceData([]);
          setLoading(false);
        }
      };
      fetchAttendance();
    }
  }, [selectedCourse, date, token]);

  // 3. Handle toggling the Present/Absent switch locally
  const handleToggle = (recordId) => {
    setAttendanceData(prevData => 
      prevData.map(record => 
        record.id === recordId ? { ...record, is_present: !record.is_present } : record
      )
    );
  };

  // 4. Send the bulk update to the Django backend
  const handleSave = async () => {
    setMessage('');
    try {
      await axios.put(`http://127.0.0.1:8000/api/academics/faculty/courses/${selectedCourse}/attendance/${date}/`, 
        attendanceData, // Sending the whole array of records
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Attendance saved successfully!');
    } catch (err) {
      setMessage('❌ Failed to save attendance.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="dashboard-title">Daily Attendance Sheet</h2>
      <p className="dashboard-subtitle">Select a course and date to record attendance.</p>

      {/* Controls Container */}
      <div className="roster-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end' }}>
        
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>Select Course:</label>
          <select 
            className="modern-select" 
            style={{ width: '100%' }}
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="" disabled>-- Choose a course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>Select Date:</label>
          {/* Using a modern styled date input */}
          <input 
            type="date" 
            className="modern-select"
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

      </div>

      {/* The Roster & Grading Area */}
      {selectedCourse ? (
        <div className="roster-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="section-title" style={{ border: 'none', margin: 0 }}>Class Roster</h3>
            <button 
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff3333',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
            >
              Save Attendance
            </button>
          </div>

          {message && (
            <div className={`status-message ${message.includes('✅') ? 'status-success' : 'status-error'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <p style={{ color: '#aaa', textAlign: 'center' }}>Loading roster...</p>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student Username</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map(record => (
                  <tr key={record.id}>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{record.student_name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleToggle(record.id)}
                        style={{
                          padding: '8px 16px',
                          border: `1px solid ${record.is_present ? '#4ade80' : '#ff6b6b'}`,
                          backgroundColor: record.is_present ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                          color: record.is_present ? '#4ade80' : '#ff6b6b',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          width: '100px'
                        }}
                      >
                        {record.is_present ? 'Present' : 'Absent'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && attendanceData.length === 0 && (
            <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No students enrolled in this course.</p>
          )}
        </div>
      ) : (
        <p style={{ color: '#888', textAlign: 'center' }}>Please select a course to view the attendance sheet.</p>
      )}
    </div>
  );
}