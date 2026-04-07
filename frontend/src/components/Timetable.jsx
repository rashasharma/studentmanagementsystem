import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function Timetable({ token }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/academics/enroll/', {
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
                <tr key={`attendance-${cls.id}`}>
                  <td style={{ fontWeight: 'bold', color: '#ffffff' }}>{cls.course_code}</td>
                  <td style={{ color: '#aaaaaa' }}>{cls.course_name}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: percentColor }}>
                    {cls.attendance_percentage}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {schedule.length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No enrollment data found.</p>}
      </div>
    </div>
  );
}