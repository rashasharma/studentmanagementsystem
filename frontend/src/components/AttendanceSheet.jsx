import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AttendanceSheet({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  
  // Default the date picker to today!
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [message, setMessage] = useState('');

  // 1. Fetch the Professor's courses when the page loads
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/academics/faculty/courses/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, [token]);

  // 2. Fetch the attendance sheet whenever the course OR the date changes
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      const fetchAttendance = async () => {
        setMessage(''); // Clear old messages
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/academics/faculty/courses/${selectedCourse}/attendance/${selectedDate}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAttendanceRecords(response.data);
        } catch (err) {
          console.error("Failed to fetch attendance sheet", err);
          setMessage("❌ Failed to load roster.");
        }
      };
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate, token]);

  // 3. Handle checking/unchecking the present box
  const toggleAttendance = (recordId) => {
    setAttendanceRecords(records => 
      records.map(record => 
        record.id === recordId ? { ...record, is_present: !record.is_present } : record
      )
    );
  };

  // 4. Submit the whole sheet back to Django
  const saveAttendance = async () => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/academics/faculty/courses/${selectedCourse}/attendance/${selectedDate}/`, 
        attendanceRecords, // Send the whole array of data!
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Attendance saved successfully!');
    } catch (err) {
      setMessage('❌ Failed to save attendance.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>Daily Attendance</h2>
      
      {/* Controls: Course Dropdown and Date Picker */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Select Course:</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ padding: '8px', width: '250px' }}
          >
            <option value="" disabled>-- Choose a Course --</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code}: {course.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px' }}
          />
        </div>
      </div>

      {/* The Attendance Sheet */}
      {selectedCourse && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Class Roster</h3>
            {message && <span style={{ fontWeight: 'bold', color: message.includes('✅') ? '#28a745' : '#dc3545' }}>{message}</span>}
          </div>
          
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Student Name</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Present?</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #eee', backgroundColor: record.is_present ? 'transparent' : '#fff3cd' }}>
                  <td style={{ padding: '10px' }}>{record.student_name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={record.is_present}
                      onChange={() => toggleAttendance(record.id)}
                      style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendanceRecords.length === 0 ? (
            <p style={{ color: '#666' }}>No students enrolled in this course.</p>
          ) : (
            <button 
              onClick={saveAttendance}
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
            >
              Save Attendance
            </button>
          )}
        </div>
      )}
    </div>
  );
}