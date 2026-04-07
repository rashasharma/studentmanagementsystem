import { useState } from 'react';
import axios from 'axios';
import '../Dashboard.css';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // Default selected role
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1. Get the Token
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username,
        password
      });
      
      const token = response.data.access;
      
      // 2. Verify the role
      const meResponse = await axios.get('http://127.0.0.1:8000/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (meResponse.data.role !== role) {
        setError(`Access Denied: This account is not registered as a ${role}.`);
        return; 
      }

      // 3. If everything matches, log them in!
      localStorage.setItem('access_token', token);
      setToken(token);

    } catch (err) {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <form onSubmit={handleLogin} className="modern-card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h2 className="dashboard-title" style={{ textAlign: 'center', marginBottom: '30px' }}>EduCore Sign In</h2>
        
        {error && <div className="status-message status-error">{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
          <input 
            type="text" 
            className="modern-select"
            style={{ width: '100%', padding: '12px' }}
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            className="modern-select"
            style={{ width: '100%', padding: '12px' }}
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: '0.9rem' }}>
          <label><input type="radio" value="STUDENT" checked={role === 'STUDENT'} onChange={(e) => setRole(e.target.value)} /> Student</label>
          <label><input type="radio" value="FACULTY" checked={role === 'FACULTY'} onChange={(e) => setRole(e.target.value)} /> Faculty</label>
          <label><input type="radio" value="FINANCE" checked={role === 'FINANCE'} onChange={(e) => setRole(e.target.value)} /> Finance</label>
          <label><input type="radio" value="ADMIN" checked={role === 'ADMIN'} onChange={(e) => setRole(e.target.value)} /> Admin</label>
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#ff3333', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
          Sign In
        </button>
      </form>
    </div>
  );
}