import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FacultyDashboard({ token }) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [roster, setRoster] = useState([]);
  const [message, setMessage] = useState('');

  // 1. Fetch the Professor's assigned courses on load
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

  // 2. Fetch the roster when a specific course is clicked
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

  // 3. Update a student's grade
  const handleGradeUpdate = async (enrollmentId, newGrade) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/academics/faculty/enrollment/${enrollmentId}/grade/`, 
        { grade: newGrade },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Grade updated successfully!');
      viewRoster(selectedCourse); // Refresh the roster to show the new grade
    } catch (err) {
      setMessage('❌ Failed to update grade.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>Faculty Dashboard</h2>
      
      {/* Course List Section */}
      <div style={{ marginBottom: '30px' }}>
        <h3>My Assigned Courses</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {courses.map(course => (
            <button 
              key={course.id} 
              onClick={() => viewRoster(course.id)}
              style={{ padding: '10px', backgroundColor: selectedCourse === course.id ? '#0056b3' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {course.code}: {course.name}
            </button>
          ))}
        </div>
        {courses.length === 0 && <p>You have no courses assigned to you.</p>}
      </div>

      {/* Roster & Grading Section */}
      {selectedCourse && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h3>Class Roster</h3>
          {message && <p style={{ color: message.includes('✅') ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>{message}</p>}
          
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px' }}>Student Name</th>
                <th style={{ padding: '10px' }}>Course</th>
                <th style={{ padding: '10px' }}>Current Grade</th>
                <th style={{ padding: '10px' }}>Assign Grade</th>
              </tr>
            </thead>
            <tbody>
              {roster.map(enrollment => (
                <tr key={enrollment.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{enrollment.student_name}</td>
                  <td style={{ padding: '10px' }}>{enrollment.course_name}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{enrollment.grade || 'Not Graded'}</td>
                  <td style={{ padding: '10px' }}>
                    <select 
                      onChange={(e) => handleGradeUpdate(enrollment.id, e.target.value)}
                      defaultValue={enrollment.grade || ""}
                      style={{ padding: '5px' }}
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
          {roster.length === 0 && <p>No students enrolled in this course yet.</p>}
        </div>
      )}
    </div>
  );
}