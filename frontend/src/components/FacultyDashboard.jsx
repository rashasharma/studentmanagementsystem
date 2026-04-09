import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function FacultyDashboard({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('https://studentmanagementsystem-mcd6.onrender.com/api/academics/faculty/courses/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (err) {
        console.error("Failed to fetch faculty courses", err);
      }
    };
    fetchCourses();
  }, [token]);

  const viewRoster = async (courseId) => {
    setMessage('');
    try {
      const response = await axios.get(`https://studentmanagementsystem-mcd6.onrender.com/api/academics/faculty/courses/${courseId}/roster/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoster(response.data);
      setSelectedCourse(courseId);
    } catch (err) {
      console.error("Failed to fetch roster", err);
    }
  };

  const handleGradeUpdate = async (enrollmentId, newGrade) => {
    try {
      await axios.patch(`https://studentmanagementsystem-mcd6.onrender.com/api/academics/faculty/enrollment/${enrollmentId}/grade/`, 
        { grade: newGrade },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Grade updated successfully!');
      viewRoster(selectedCourse); 
    } catch (err) {
      setMessage('❌ Failed to update grade.');
    }
  };

  return (
    <div>
      <h2 className="dashboard-title">Faculty Dashboard</h2>
      <p className="dashboard-subtitle">Manage your timetable, courses, and student grades.</p>

      {/* --- WEEKLY SCHEDULE SECTION --- */}
      <h3 className="section-title">My Weekly Schedule</h3>
      <div style={{ display: 'grid', gap: '15px', marginBottom: '40px' }}>
        {courses.length === 0 ? (
          <div className="roster-container">
            <p style={{ textAlign: 'center', color: '#888888', margin: 0 }}>You have no scheduled classes.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={`schedule-${course.id}`} style={{ 
              padding: '20px 25px', backgroundColor: '#222222', 
              borderLeft: '5px solid #4ade80', borderTop: '1px solid #333',
              borderRight: '1px solid #333', borderBottom: '1px solid #333',
              borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#ffffff', fontSize: '1.2rem' }}>
                {course.course_code}: {course.course_name}
              </h3>
              <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '0.9rem' }}>
                Batches: {course.batches && course.batches.length > 0 
                  ? course.batches.map(b => b.name).join(', ') 
                  : (course.batch_names || 'None')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {course.schedules && course.schedules.length > 0 ? (
                  course.schedules.map((slot, index) => (
                    <div key={index} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: '#1a1a1a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #333'
                    }}>
                      <div style={{ color: '#cccccc', fontWeight: '500' }}>
                        <span style={{ color: '#4ade80', marginRight: '5px' }}>📅</span> 
                        <span style={{ width: '90px', display: 'inline-block' }}>{slot.day}</span> 
                        <span style={{ color: '#4ade80', margin: '0 5px 0 10px' }}>⏰</span> 
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <span style={{ fontWeight: 'bold', color: '#eeeeee', fontSize: '0.9rem' }}>
                        📍 Room: {slot.room_number || 'TBA'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: '#ff6b6b', fontStyle: 'italic' }}>Schedule pending (TBD)</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- COURSE LIST SECTION --- */}
      <div>
        <h3 className="section-title">Grading & Rosters</h3>
        <div className="course-grid">
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => viewRoster(course.id)}
              className={`course-card ${selectedCourse === course.id ? 'active' : ''}`}
            >
              <div style={{ fontWeight: 'bold' }}>{course.course_code}: {course.course_name}</div>
              <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '5px' }}>
                Batches: {course.batches && course.batches.length > 0 
                  ? course.batches.map(b => b.name).join(', ') 
                  : (course.batch_names || 'None')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ROSTER SECTION --- */}
      {selectedCourse && (
        <div className="roster-container" style={{ marginTop: '20px' }}>
          <h3 className="section-title" style={{ border: 'none', marginBottom: '5px' }}>Class Roster</h3>
          {message && (
            <div className={`status-message ${message.includes('✅') ? 'status-success' : 'status-error'}`}>
              {message}
            </div>
          )}
          <table className="modern-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Course</th>
                <th>Current Grade</th>
                <th>Assign Grade</th>
              </tr>
            </thead>
            <tbody>
              {roster.map(enrollment => (
                <tr key={enrollment.id}>
                  <td style={{ fontWeight: '500' }}>{enrollment.student_name}</td>
                  <td style={{ color: '#aaa' }}>{enrollment.course_name}</td>
                  <td style={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem',
                    color: enrollment.grade ? '#4ade80' : '#888' 
                  }}>
                    {enrollment.grade || '—'}
                  </td>
                  <td>
                    <select 
                      className="modern-select"
                      onChange={(e) => handleGradeUpdate(enrollment.id, e.target.value)}
                      value={enrollment.grade || ""}
                    >
                      <option value="" disabled>Select</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {roster.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No students enrolled.</p>}
        </div>
      )}
    </div>
  );
}