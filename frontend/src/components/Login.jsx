import { useState } from 'react';
import axios from 'axios';

export default function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await axios.post('https://studentmanagementsystem-mcd6.onrender.com/api/auth/login/', {
        username,
        password
      });
      
      const token = response.data.access;
      
      const meResponse = await axios.get('https://studentmanagementsystem-mcd6.onrender.com/api/auth/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (meResponse.data.role !== role) {
        setError(`Access Denied: Registered as ${meResponse.data.role || 'UNKNOWN'}, not ${role}.`);
        setIsLoading(false);
        return; 
      }

      localStorage.setItem('access_token', token);
      setToken(token);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Invalid username or password.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network Error: Cannot connect to the server.');
      } else {
        setError('An unexpected system error occurred.');
      }
      setIsLoading(false);
    }
  };

  // Modern input styling
  const inputStyle = {
    width: '100%', padding: '14px 16px', backgroundColor: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px',
    color: '#f8fafc', fontSize: '1rem', outline: 'none', transition: 'all 0.3s ease'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', width: '100%' }}>
      <form onSubmit={handleLogin} className="modern-card" style={{ width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px' }}>
        
        {/* Sleek Enterprise Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h1 className="brand-logo" style={{ fontSize: '2.2rem', margin: '0 0 5px 0', display: 'flex', justifyContent: 'center' }}>
  Meridian<span style={{ WebkitTextFillColor: '#f8fafc', fontWeight: 300 }}>Portal</span>
</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Secure access to your academic workspace</p>
        </div>
        
        {/* Modern Error Banner */}
        {error && (
          <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', borderLeft: '4px solid #f43f5e', padding: '12px 16px', borderRadius: '6px', color: '#f8fafc', fontSize: '0.9rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideUp 0.3s ease forwards' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Inputs */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Username</label>
          <input 
            type="text" value={username} onChange={(e) => setUsername(e.target.value)} required 
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#38bdf8'; e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Password</label>
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#38bdf8'; e.target.style.boxShadow = '0 0 0 3px rgba(56, 189, 248, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Custom Role Selection Pills (Replaces ugly radio buttons) */}
        <div style={{ marginBottom: '35px' }}>
          <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '600' }}>Select Authorization Level</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['STUDENT', 'FACULTY', 'FINANCE', 'ADMIN'].map((r) => (
              <div 
                key={r} 
                onClick={() => setRole(r)}
                style={{
                  padding: '12px 10px', textAlign: 'center', borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s ease',
                  border: role === r ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: role === r ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  color: role === r ? '#38bdf8' : '#94a3b8'
                }}
              >
                {r === 'STUDENT' ? '🎓 ' : r === 'FACULTY' ? '👨‍🏫 ' : r === 'FINANCE' ? '💰 ' : '⚙️ '}
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </div>
            ))}
          </div>
        </div>

        {/* Gradient Sign In Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: '100%', padding: '14px', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', 
            color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.05rem', 
            cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)', opacity: isLoading ? 0.7 : 1
          }}
          onMouseEnter={(e) => { if(!isLoading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.4)'; } }}
          onMouseLeave={(e) => { if(!isLoading) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(56, 189, 248, 0.3)'; } }}
        >
          {isLoading ? 'Authenticating...' : 'Secure Sign In'}
        </button>
        
      </form>
    </div>
  );
}