import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseList from './components/CourseList'
import FacultyDashboard from './components/FacultyDashboard'
import Transcript from './components/Transcript'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AttendanceSheet from './components/AttendanceSheet'
import Timetable from './components/Timetable'
import './App.css'

function App() {
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [currentView, setCurrentView] = useState('') 
  
  const [notifications, setNotifications] = useState([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    if (savedToken) setToken(savedToken)
  }, [])

  useEffect(() => {
    if (token) {
      axios.get('http://127.0.0.1:8000/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const userRole = response.data.role;
        setRole(userRole);
        
        if (userRole === 'FACULTY') setCurrentView('faculty');
        if (userRole === 'STUDENT') setCurrentView('dashboard');
        if (userRole === 'ADMIN') setCurrentView('analytics'); 
        if (userRole === 'FINANCE') setCurrentView('finance_home');
      })
      .catch(err => {
        handleLogout();
      });

      fetchNotifications();
    }
  }, [token])

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/academics/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/academics/notifications/${id}/read/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.filter(n => n.id !== id));
      if (notifications.length === 1) setShowNotifDropdown(false);
    } catch (err) {
      console.error("Failed to mark read");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setRole(null)
    setCurrentView('')
  }

  const getNavClass = (viewName) => {
    return currentView === viewName ? "nav-btn active" : "nav-btn";
  };

  return (
    <div className="App">
      
      <header className="app-header">
        <h1 className="app-logo">EduCore SMS</h1>
        
        {token && role && (
          <div className="nav-controls">
            
            {role === 'STUDENT' && (
              <>
                <button onClick={() => setCurrentView('dashboard')} className={getNavClass('dashboard')}>My Personal Info</button>
                <button onClick={() => setCurrentView('fees')} className={getNavClass('fees')}>Academic / Misc. Fee</button>
                <button onClick={() => setCurrentView('courses')} className={getNavClass('courses')}>Registration</button>
                <button onClick={() => setCurrentView('timetable')} className={getNavClass('timetable')}>Class and Attendance</button>
                <button onClick={() => setCurrentView('transcript')} className={getNavClass('transcript')}>Exam and Result</button>
              </>
            )}

            {role === 'FACULTY' && (
              <>
                <button onClick={() => setCurrentView('faculty')} className={getNavClass('faculty')}>My Courses</button>
                <button onClick={() => setCurrentView('attendance')} className={getNavClass('attendance')}>Attendance</button>
                <button onClick={() => setCurrentView('analytics')} className={getNavClass('analytics')}>Analytics</button>
              </>
            )}

            {role === 'FINANCE' && (
              <>
                <button onClick={() => setCurrentView('finance_home')} className={getNavClass('finance_home')}>Fee Collections</button>
                <button onClick={() => setCurrentView('analytics')} className={getNavClass('analytics')}>Financial Reports</button>
              </>
            )}

            {role === 'ADMIN' && (
              <>
                <button onClick={() => setCurrentView('analytics')} className={getNavClass('analytics')}>System Analytics</button>
                <a 
                  href="http://127.0.0.1:8000/admin/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="nav-btn" 
                  style={{ textDecoration: 'none', color: '#ffb86c' }}
                >
                  Raw Database ↗
                </a>
              </>
            )}

            <div style={{ position: 'relative', marginRight: '10px', marginLeft: '10px' }}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative' }}
              >
                🔔
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-5px',
                    backgroundColor: '#ff3333', color: 'white', borderRadius: '50%',
                    padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold'
                  }}>
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifDropdown && notifications.length > 0 && (
                <div style={{
                  position: 'absolute', top: '40px', right: '0',
                  backgroundColor: '#222', border: '1px solid #444', borderRadius: '8px',
                  width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 1000
                }}>
                  <h4 style={{ margin: 0, padding: '15px', borderBottom: '1px solid #333', color: '#fff' }}>Unread Alerts</h4>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.map(notif => (
                      <div key={notif.id} style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '0.9rem', color: '#ccc' }}>
                        <p style={{ margin: '0 0 10px 0' }}>{notif.message}</p>
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Mark as read ✓
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="nav-divider"></div>
            
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        )}
      </header>
      
      <main className="app-main">
        {!token ? (
          <Login setToken={setToken} />
        ) : (
          <div className="modern-card">
            {currentView === 'dashboard' && <Dashboard token={token} />}
            {currentView === 'courses' && <CourseList token={token} />}
            {currentView === 'timetable' && <Timetable token={token} />}
            {currentView === 'transcript' && <Transcript token={token} />}
            {currentView === 'faculty' && <FacultyDashboard token={token} />}
            {currentView === 'attendance' && <AttendanceSheet token={token} />}
            {currentView === 'analytics' && <AnalyticsDashboard token={token} />}
            
            {currentView === 'fees' && (
              <div>
                <h2 className="dashboard-title">Academic / Misc. Fee</h2>
                <p className="dashboard-subtitle">Manage your tuition and miscellaneous payments.</p>
                <div className="roster-container">
                  <p style={{ textAlign: 'center', color: '#888', padding: '40px 20px', fontSize: '1.1rem' }}>
                    ✅ You have no outstanding fees at this time.
                  </p>
                </div>
              </div>
            )}

            {currentView === 'finance_home' && (
              <div>
                <h2 className="dashboard-title">Fee Collections Department</h2>
                <p className="dashboard-subtitle">Manage student tuition, late fees, and financial holds.</p>
                
                <div className="roster-container">
                  <h3 className="section-title">Recent Transactions</h3>
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ color: '#fff', fontWeight: 'bold' }}>student1</td>
                        <td style={{ color: '#aaa' }}>Fall Semester Tuition (24A12)</td>
                        <td style={{ color: '#fff' }}>₹ 85,000</td>
                        <td style={{ textAlign: 'right', color: '#ffb86c', fontWeight: 'bold' }}>Pending</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === '' && <div style={{textAlign: 'center', padding: '50px', color: '#aaa'}}>Loading your workspace...</div>}
          </div>
        )}
      </main>
    </div>
  )
}

export default App