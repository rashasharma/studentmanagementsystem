import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseList from './components/CourseList'
import FacultyDashboard from './components/FacultyDashboard'
import Transcript from './components/Transcript'
import './App.css'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import AttendanceSheet from './components/AttendanceSheet'

function App() {
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null) // State to store 'STUDENT' or 'FACULTY'
  const [currentView, setCurrentView] = useState('') 

  // 1. Check for token on load
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    if (savedToken) setToken(savedToken)
  }, [])

  // 2. Whenever the token changes, fetch the user's role!
  useEffect(() => {
    if (token) {
      axios.get('http://127.0.0.1:8000/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const userRole = response.data.role;
        setRole(userRole);
        // Automatically route them to the correct home screen
        if (userRole === 'FACULTY') setCurrentView('faculty');
        if (userRole === 'STUDENT') setCurrentView('dashboard');
      })
      .catch(err => {
        console.error("Failed to fetch user role", err);
        handleLogout(); // If token is invalid, log them out
      });
    }
  }, [token])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setRole(null)
    setCurrentView('')
  }

  return (
    <div className="App" style={{ fontFamily: 'sans-serif' }}>
      {/* Polished Navigation Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#1a1a2e', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>EduCore SMS</h1>
        
        {token && role && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            
            {/* STUDENT ONLY BUTTONS */}
            {role === 'STUDENT' && (
              <>
                <button onClick={() => setCurrentView('dashboard')} style={navButtonStyle(currentView === 'dashboard')}>Profile</button>
                <button onClick={() => setCurrentView('courses')} style={navButtonStyle(currentView === 'courses')}>Enrollment</button>
                <button onClick={() => setCurrentView('transcript')} style={navButtonStyle(currentView === 'transcript')}>My Grades</button>
              </>
            )}

            {/* FACULTY ONLY BUTTONS */}
         {role === 'FACULTY' && (
           <>
             <button onClick={() => setCurrentView('faculty')} style={navButtonStyle(currentView === 'faculty')}>Faculty Dashboard</button>
             <button onClick={() => setCurrentView('attendance')} style={navButtonStyle(currentView === 'attendance')}>Take Attendance</button> {/* ADD THIS LINE */}
             <button onClick={() => setCurrentView('analytics')} style={navButtonStyle(currentView === 'analytics')}>School Analytics</button>
           </>
         )}

            {/* SHARED LOGOUT BUTTON */}
            <div style={{ width: '2px', height: '20px', backgroundColor: '#444', margin: '0 10px' }}></div>
            <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#e63946', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Logout
            </button>
          </div>
        )}
      </header>
      
      <main style={{ padding: '30px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
        {!token ? (
          <Login setToken={setToken} />
        ) : (
          /* Render the correct view based on state */
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {currentView === 'dashboard' && <Dashboard token={token} />}
            {currentView === 'courses' && <CourseList token={token} />}
            {currentView === 'transcript' && <Transcript token={token} />}
         {currentView === 'faculty' && <FacultyDashboard token={token} />}
         {currentView === 'attendance' && <AttendanceSheet token={token} />} {/* ADD THIS LINE */}
         {currentView === 'analytics' && <AnalyticsDashboard token={token} />}
         {currentView === '' && <div style={{textAlign: 'center', padding: '50px'}}>Loading your workspace...</div>}
          </div>
        )}
      </main>
    </div>
  )
}

// A quick helper function to make active buttons look "pressed"
function navButtonStyle(isActive) {
  return {
    padding: '8px 15px',
    backgroundColor: isActive ? '#457b9d' : 'transparent',
    color: 'white',
    border: isActive ? 'none' : '1px solid #457b9d',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  }
}

export default App