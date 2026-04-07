import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css'; // Import our new shared styles!

export default function FacultyDashboard({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [message, setMessage] = useState('');

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

  const viewRoster = async (courseId) => {
    setMessage('');
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/academics/faculty/courses/${courseId}/roster/`, {
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
      await axios.patch(`http://127.0.0.1:8000/api/academics/faculty/enrollment/${enrollmentId}/grade/`, 
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
      <p className="dashboard-subtitle">Manage your assigned courses and student grades.</p>
      
      {/* Course List Section */}
      <div>
        <h3 className="section-title">My Assigned Courses</h3>
        <div className="course-grid">
          {courses.map(course => (
            <div 
              key={course.id} 
              onClick={() => viewRoster(course.id)}
              className={`course-card ${selectedCourse === course.id ? 'active' : ''}`}
            >
              {course.code}: {course.name}
            </div>
          ))}
          {courses.length === 0 && <p style={{color: '#888'}}>You have no courses assigned to you.</p>}
        </div>
      </div>

      {/* Roster & Grading Section */}
      {selectedCourse && (
        <div className="roster-container">
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
          {roster.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No students enrolled in this course yet.</p>}
        </div>
      )}
    </div>
  );
}