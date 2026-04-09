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
      axios.get('https://studentmanagementsystem-mcd6.onrender.com/api/auth/me/', {
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
      const res = await axios.get('https://studentmanagementsystem-mcd6.onrender.com/api/academics/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`https://studentmanagementsystem-mcd6.onrender.com/api/academics/notifications/${id}/read/`, {}, {
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
    <div className="app-container">
      
      {/* --- THE NEW ENTERPRISE SIDEBAR --- */}
      {token && role && (
        <aside className="sidebar">
          <h1 className="brand-logo">Meridian<span style={{ WebkitTextFillColor: '#f8fafc', fontWeight: 300 }}>Portal</span></h1>
          
          <div className="nav-menu">
            {/* STUDENT MENU */}
            {role === 'STUDENT' && (
              <>
                <button onClick={() => setCurrentView('dashboard')} className={getNavClass('dashboard')}>👤 My Profile</button>
                <button onClick={() => setCurrentView('courses')} className={getNavClass('courses')}>📚 Registration</button>
                <button onClick={() => setCurrentView('timetable')} className={getNavClass('timetable')}>📅 Class & Attendance</button>
                <button onClick={() => setCurrentView('transcript')} className={getNavClass('transcript')}>🎓 Exam & Results</button>
                <button onClick={() => setCurrentView('fees')} className={getNavClass('fees')}>💳 Fee Management</button>
              </>
            )}

            {/* FACULTY MENU */}
            {role === 'FACULTY' && (
              <>
                <button onClick={() => setCurrentView('faculty')} className={getNavClass('faculty')}>👨‍🏫 My Courses</button>
                <button onClick={() => setCurrentView('attendance')} className={getNavClass('attendance')}>📝 Attendance</button>
                <button onClick={() => setCurrentView('analytics')} className={getNavClass('analytics')}>📊 Analytics</button>
              </>
            )}

            {/* FINANCE MENU */}
            {role === 'FINANCE' && (
              <>
                <button onClick={() => setCurrentView('finance_home')} className={getNavClass('finance_home')}>💰 Fee Collections</button>
                <button onClick={() => setCurrentView('analytics')} className={getNavClass('analytics')}>📈 Financial Reports</button>
              </>
            )}

            {/* ADMIN MENU */}
            {role === 'ADMIN' && (
              <>
                <button onClick={() => setCurrentView('analytics')} className={getNavClass('analytics')}>⚙️ System Analytics</button>
                <a href="https://studentmanagementsystem-mcd6.onrender.com/admin/" target="_blank" rel="noreferrer" className="nav-btn">
                  🗄️ Raw Database ↗
                </a>
              </>
            )}
          </div>

          {/* NOTIFICATION & LOGOUT AREA */}
          <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="nav-btn"
              style={{ position: 'relative', justifyContent: 'space-between' }}
            >
              <span>🔔 Notifications</span>
              {notifications.length > 0 && (
                <span style={{
                  backgroundColor: '#f43f5e', color: 'white', borderRadius: '50%',
                  padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold'
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown (Now opens upwards from sidebar) */}
            {showNotifDropdown && notifications.length > 0 && (
              <div style={{
                position: 'absolute', bottom: '130px', left: '20px', width: '300px',
                backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden'
              }}>
                <h4 style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', margin: 0 }}>Recent Alerts</h4>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                      <p style={{ margin: '0 0 10px 0', color: '#e2e8f0' }}>{notif.message}</p>
                      <button onClick={() => markAsRead(notif.id)} style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Mark as read ✓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleLogout} className="logout-btn">
              🚪 Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* --- THE MAIN CONTENT CANVAS --- */}
      <main className={token ? "main-content" : ""} style={!token ? { width: '100%', display: 'flex', justifyContent: 'center' } : {}}>
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
                <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '3rem' }}>✅</span>
                  <h3 style={{ marginTop: '15px', color: '#f8fafc' }}>You are all caught up!</h3>
                  <p style={{ color: '#94a3b8' }}>You have no outstanding fees at this time.</p>
                </div>
              </div>
            )}

            {currentView === 'finance_home' && (
              <div>
                <h2 className="dashboard-title">Fee Collections</h2>
                <p className="dashboard-subtitle">Manage student tuition, late fees, and financial holds.</p>
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
                      <td style={{ color: '#94a3b8' }}>Fall Semester Tuition (24A12)</td>
                      <td style={{ color: '#fff' }}>₹ 85,000</td>
                      <td style={{ textAlign: 'right', color: '#f59e0b', fontWeight: 'bold' }}>Pending</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
      
    </div>
  )
}

export default App