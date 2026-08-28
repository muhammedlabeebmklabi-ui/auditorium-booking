import { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/login', {
        username,
        password
      });
      setMessage('Login successful! Token: ' + response.data.access_token);
    } catch (error) {
      setMessage('Login failed: Invalid credentials');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Auditorium Booking Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left' }}>
        <div>
          <label>Username: </label><br />
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ padding: '8px', margin: '8px 0', width: '200px' }}
          />
        </div>
        <div>
          <label>Password: </label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '8px', margin: '8px 0', width: '200px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default App;