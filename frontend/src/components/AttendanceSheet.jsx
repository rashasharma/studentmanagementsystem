import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function AttendanceSheet({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [activeCourseDetails, setActiveCourseDetails] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (selectedCourse) {
      const details = courses.find(c => c.id === parseInt(selectedCourse));
      setActiveCourseDetails(details);
    } else {
      setActiveCourseDetails(null);
    }
  }, [selectedCourse, courses]);

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

  const handleToggle = (recordId) => {
    setAttendanceData(prevData => 
      prevData.map(record => 
        record.id === recordId ? { ...record, is_present: !record.is_present } : record
      )
    );
  };

  const handleSave = async () => {
    setMessage('');
    try {
      await axios.put(`http://127.0.0.1:8000/api/academics/faculty/courses/${selectedCourse}/attendance/${date}/`, 
        attendanceData,
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
              <option key={c.id} value={c.id}>{c.course_code}: {c.course_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>Select Date:</label>
          <input 
            type="date" 
            className="modern-select"
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {activeCourseDetails && (
        <div style={{ backgroundColor: '#1a1a1a', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #4ade80' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Class Details</h4>
          <p style={{ margin: '0 0 5px 0', color: '#aaa', fontSize: '0.9rem' }}>
            <strong style={{ color: '#ccc' }}>Batches:</strong>{' '}
            {activeCourseDetails.batches && activeCourseDetails.batches.length > 0 
              ? activeCourseDetails.batches.map(b => b.name).join(', ') 
              : (activeCourseDetails.batch_names || 'None Assigned')}
          </p>
          <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
            <strong style={{ color: '#ccc' }}>Official Meeting Times:</strong>
            <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
              {activeCourseDetails.schedules && activeCourseDetails.schedules.length > 0 ? (
                activeCourseDetails.schedules.map((slot, i) => (
                  <li key={i}>{slot.day} from {slot.start_time} to {slot.end_time} (Room {slot.room_number})</li>
                ))
              ) : (
                <li>No schedule set for this course.</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {selectedCourse ? (
        <div className="roster-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="section-title" style={{ border: 'none', margin: 0 }}>Attendance Roster</h3>
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