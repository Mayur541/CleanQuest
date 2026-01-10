import { useState } from 'react';
import { api } from '../api';
import { useNavigate, Link } from 'react-router-dom';

function Signup({ role }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState(''); 
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      // 1. Construct the data payload
      const payload = { username, password };
      
      // 2. Only add the secret key if it is an Admin registration
      if (role === 'admin') {
        payload.secretKey = secretKey;
      }
      
      // 3. Send to backend
      await api.post('/api/auth/signup', payload);
      
      alert("Account Created! Please Login.");
      
      // 4. Redirect to the correct login page based on role
      navigate(role === 'admin' ? '/login/admin' : '/login/user');
    } catch (err) {
      alert(err.response?.data?.error || "Signup Failed");
    }
  };

  // Dynamic UI elements based on role
  const isAdmin = role === 'admin';
  const title = isAdmin ? 'Admin Registration' : 'User Registration';
  const subtext = isAdmin ? 'Restricted Area. Authorized Access Only.' : 'Join your community and start reporting.';
  const borderColor = isAdmin ? 'border-red-600 dark:border-red-500' : 'border-green-600 dark:border-green-500';
  const buttonColor = isAdmin ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 ${borderColor}`}>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">{title}</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">{subtext}</p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          {/* --- SECRET KEY FIELD (ONLY FOR ADMINS) --- */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-bold text-red-600 dark:text-red-400 mb-1">Municipal Secret Key 🔒</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border-2 border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition" 
                placeholder="Enter official code..."
                value={secretKey} 
                onChange={(e) => setSecretKey(e.target.value)} 
                required 
              />
            </div>
          )}

          <button 
            type="submit" 
            className={`w-full text-white py-3 rounded-lg font-bold shadow-md transition ${buttonColor}`}
          >
            Create {isAdmin ? 'Admin' : 'User'} Account
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account? <Link to={`/login/${role}`} className="text-green-700 dark:text-green-400 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;