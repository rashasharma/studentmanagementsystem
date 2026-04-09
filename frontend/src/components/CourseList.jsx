import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function CourseList({ token }) {
  const [allCourses, setAllCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // NEW: Pagination State
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // We wrap the fetch in a reusable function so we can pass it different page URLs
  const fetchCourses = async (url = 'https://studentmanagementsystem-mcd6.onrender.com/api/academics/courses/') => {
    try {
      const coursesRes = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Because Django is paginating, the actual courses are inside the `.results` array!
      setAllCourses(coursesRes.data.results);
      setNextPage(coursesRes.data.next);
      setPrevPage(coursesRes.data.previous);

      // Fetch the student's enrollments to hide the "Enroll" button if they are already in it
      const enrollRes = await axios.get('https://studentmanagementsystem-mcd6.onrender.com/api/academics/enroll/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyEnrollments(enrollRes.data.map(enrollment => enrollment.course)); 
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses();
  }, [token]);

  const handleEnroll = async (courseId) => {
    setMessage('');
    setError('');
    try {
      await axios.post('https://studentmanagementsystem-mcd6.onrender.com/api/academics/enroll/', 
        { course: courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Successfully enrolled in course!');
      setMyEnrollments([...myEnrollments, courseId]); 
    } catch (err) {
      setError('❌ Failed to enroll. You may already be registered for this class.');
    }
  };

  return (
    <div>
      <h2 className="dashboard-title">Course Registration</h2>
      <p className="dashboard-subtitle">Browse available classes and add them to your schedule.</p>

      {message && <div className="status-message status-success">{message}</div>}
      {error && <div className="status-message status-error">{error}</div>}

      <div className="roster-container">
        <h3 className="section-title" style={{ border: 'none', marginBottom: '5px' }}>Available Courses</h3>
        
        <table className="modern-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Description</th>
              <th>Credits</th>
              <th>Schedule</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {allCourses.map((course) => {
              const isEnrolled = myEnrollments.includes(course.id);
              
              return (
                <tr key={course.id}>
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#ffffff', fontSize: '1.1rem' }}>{course.code}</div>
                    <div style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>{course.name}</div>
                  </td>
                  <td style={{ color: '#888888', maxWidth: '250px' }}>{course.description || 'No description provided.'}</td>
                  <td style={{ color: '#cccccc', fontWeight: 'bold' }}>{course.credits}</td>
                  <td style={{ color: '#aaaaaa', fontSize: '0.9rem' }}>
                     {course.days_of_week ? `${course.days_of_week}` : 'TBA'} <br/>
                     {course.start_time ? `${course.start_time}` : ''}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {isEnrolled ? (
                      <span style={{ color: '#4ade80', fontWeight: 'bold', backgroundColor: 'rgba(74, 222, 128, 0.1)', padding: '8px 15px', borderRadius: '20px' }}>
                        ✓ Enrolled
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        style={{ padding: '8px 20px', backgroundColor: '#ff3333', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Enroll +
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* NEW: Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #333' }}>
          <button 
            onClick={() => fetchCourses(prevPage)} 
            disabled={!prevPage}
            style={{ padding: '8px 16px', background: prevPage ? '#333' : '#1a1a1a', color: prevPage ? '#fff' : '#555', border: 'none', borderRadius: '5px', cursor: prevPage ? 'pointer' : 'not-allowed' }}
          >
            ← Previous
          </button>
          
          <span style={{ color: '#888', fontSize: '0.9rem' }}>Catalog Pages</span>

          <button 
            onClick={() => fetchCourses(nextPage)} 
            disabled={!nextPage}
            style={{ padding: '8px 16px', background: nextPage ? '#333' : '#1a1a1a', color: nextPage ? '#fff' : '#555', border: 'none', borderRadius: '5px', cursor: nextPage ? 'pointer' : 'not-allowed' }}
          >
            Next →
          </button>
        </div>
        
        {allCourses.length === 0 && (
          <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
            No courses are currently available for registration.
          </p>
        )}
      </div>
    </div>
  );
}