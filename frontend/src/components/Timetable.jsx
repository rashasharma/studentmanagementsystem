import { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function Timetable({ token }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which course's details are currently open
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('https://studentmanagementsystem-mcd6.onrender.com/api/academics/enroll/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedule(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [token]);

  // NEW: Function to open/close the daily records
  const toggleDetails = (id) => {
    setExpandedCourseId(expandedCourseId === id ? null : id);
  };

  if (loading) return <div style={{ padding: '20px', color: '#aaaaaa' }}>Loading your class data...</div>;

  return (
    <div>
      <h2 className="dashboard-title">Class and Attendance</h2>
      <p className="dashboard-subtitle">Manage your weekly schedule and track your attendance record.</p>

      <h3 className="section-title">Weekly Schedule</h3>
      <div style={{ display: 'grid', gap: '15px', marginBottom: '40px' }}>
        {schedule.length === 0 ? (
          <div className="roster-container">
            <p style={{ textAlign: 'center', color: '#888888', margin: 0 }}>You are not enrolled in any courses yet.</p>
          </div>
        ) : (
          schedule.map((cls) => (
            <div key={`schedule-${cls.id}`} style={{ 
              padding: '20px 25px', backgroundColor: '#222222', 
              borderLeft: '5px solid #ff3333', borderTop: '1px solid #333',
              borderRight: '1px solid #333', borderBottom: '1px solid #333',
              borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0px)'}
            >
              <h3 style={{ margin: '0 0 15px 0', color: '#ffffff', fontSize: '1.3rem' }}>
                {cls.course_code}: {cls.course_name}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cls.schedules && cls.schedules.length > 0 ? (
                  cls.schedules.map((slot, index) => (
                    <div key={index} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      backgroundColor: '#1a1a1a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #333'
                    }}>
                      <div style={{ color: '#cccccc', fontWeight: '500' }}>
                        <span style={{ color: '#ff3333', marginRight: '5px' }}>📅</span> 
                        <span style={{ width: '90px', display: 'inline-block' }}>{slot.day}</span> 
                        <span style={{ color: '#ff3333', margin: '0 5px 0 10px' }}>⏰</span> 
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

      <h3 className="section-title">Attendance Record</h3>
      <div className="roster-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th style={{ textAlign: 'right' }}>Attendance %</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((cls) => {
              let percentColor = '#4ade80';
              if (cls.attendance_percentage.includes('%')) {
                const num = parseInt(cls.attendance_percentage.replace('%', ''));
                if (num < 75) percentColor = '#ff6b6b';
                else if (num < 85) percentColor = '#ffb86c';
              } else {
                percentColor = '#888';
              }

              return (
                <Fragment key={`attendance-${cls.id}`}>
                  {/* Made the row clickable to trigger the dropdown */}
                  <tr 
                    style={{ cursor: 'pointer', backgroundColor: expandedCourseId === cls.id ? '#1f1f1f' : 'transparent' }} 
                    onClick={() => toggleDetails(cls.id)}
                  >
                    <td style={{ fontWeight: 'bold', color: '#ffffff' }}>
                      {cls.course_code}
                      {/* Visual indicator that it can be clicked */}
                      <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '10px', fontWeight: 'normal' }}>
                        {expandedCourseId === cls.id ? '▼ Hide Logs' : '▶ View Logs'}
                      </span>
                    </td>
                    <td style={{ color: '#aaaaaa' }}>{cls.course_name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: percentColor }}>
                      {cls.attendance_percentage}
                    </td>
                  </tr>
                  
                  {/* --- NEW: The Hidden Detailed Record View --- */}
                  {expandedCourseId === cls.id && (
                    <tr>
                      <td colSpan="3" style={{ backgroundColor: '#1a1a1a', padding: '20px', borderBottom: '1px solid #333' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#ccc', fontSize: '1rem' }}>Daily Logs:</h4>
                        {cls.attendance_details && cls.attendance_details.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                            {cls.attendance_details.map((record, idx) => (
                              <div key={idx} style={{
                                padding: '10px',
                                borderRadius: '6px',
                                border: `1px solid ${record.is_present ? '#4ade80' : '#ff6b6b'}`,
                                backgroundColor: record.is_present ? 'rgba(74, 222, 128, 0.05)' : 'rgba(255, 107, 107, 0.05)',
                                textAlign: 'center',
                                fontSize: '0.9rem'
                              }}>
                                <div style={{ color: '#eee', marginBottom: '5px' }}>{record.date}</div>
                                <div style={{ color: record.is_present ? '#4ade80' : '#ff6b6b', fontWeight: 'bold' }}>
                                  {record.is_present ? 'Present' : 'Absent'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ color: '#888', margin: 0, fontStyle: 'italic' }}>No daily attendance records have been posted yet.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {schedule.length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No enrollment data found.</p>}
      </div>
    </div>
  );
}