import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CourseList({ token }) {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch all available courses when the page loads
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/academics/courses/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };

    fetchCourses();
  }, [token]);

  const handleEnroll = async (courseId) => {
    setMessage(''); // Clear previous messages
    try {
      await axios.post('http://127.0.0.1:8000/api/academics/enroll/', 
        { course: courseId }, // Send the ID of the course we want to join
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Successfully enrolled in course!');
    } catch (err) {
      // If Django blocks it (e.g., already enrolled), show the error
      if (err.response && err.response.data) {
        // DRF usually returns validation errors as arrays
        const errorMsg = err.response.data[0] || 'Failed to enroll.';
        setMessage(`❌ ${errorMsg}`);
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>Available Courses</h2>
      
      {/* Display Success or Error Messages */}
      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '5px', backgroundColor: '#e9ecef' }}>
          <strong>{message}</strong>
        </div>
      )}

      <div style={{ display: 'grid', gap: '15px' }}>
        {courses.map(course => (
          <div key={course.id} style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0' }}>{course.code}: {course.name}</h3>
              <p style={{ margin: '0 0 5px 0', color: '#666' }}>{course.description || 'No description provided.'}</p>
              <small>Credits: {course.credits}</small>
            </div>
            
            <button 
              onClick={() => handleEnroll(course.id)}
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Enroll
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}