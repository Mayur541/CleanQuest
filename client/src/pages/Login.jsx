// client/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 // Replace the old handleLogin logic with this:
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    // Send credentials to backend
    const res = await axios.post('http://localhost:5000/api/auth/login', { username, password });
    
    if (res.status === 200) {
      // Login Success!
      localStorage.setItem("isAuthenticated", "true");
      navigate("/admin");
    }
  } catch (err) {
    setError(err.response?.data?.error || "Login Failed");
  }
};

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Municipal Login</h2>
          <p className="text-gray-500 text-sm">Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Badge ID / Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-green-900 hover:bg-green-800 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:-translate-y-1"
          >
            Access Dashboard
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-green-600">← Back to Home</a>
        </div>

      </div>
    </div>
  );
}

export default Login;