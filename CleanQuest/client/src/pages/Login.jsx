import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

function Login({ role }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // 1. Send credentials to backend
      const res = await api.post('/api/auth/login', { username, password });
      
      if (res.status === 200) {
        localStorage.setItem("isAuthenticated", "true");
        
        // 2. Redirect based on the ROLE passed to this component
        if (role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/"); // Users go to Home
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login Failed");
    }
  };

  // Dynamic UI elements based on role
  const isAdmin = role === 'admin';
  const title = isAdmin ? 'Municipal Login' : 'User Login';
  const subtext = isAdmin ? 'Authorized personnel only.' : 'Welcome back, hero!';
  const icon = isAdmin ? '🔒' : '👤';
  const iconBg = isAdmin ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30';
  const btnColor = isAdmin ? 'bg-red-800 hover:bg-red-900' : 'bg-green-700 hover:bg-green-800';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        
        <div className="text-center mb-8">
          <div className={`${iconBg} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-3xl">{icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{subtext}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:-translate-y-1 ${btnColor}`}
          >
            Login as {isAdmin ? 'Admin' : 'User'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">← Back to Home</Link>
          <div className="mt-2 text-sm">
             Need an account? <Link to={`/signup/${role}`} className="text-green-700 dark:text-green-400 font-bold hover:underline">Register here</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;