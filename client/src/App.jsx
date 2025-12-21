// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Signup from './pages/Signup'; 
import ProtectedRoute from './components/ProtectedRoute'; 
import Leaderboard from './pages/Leaderboard';

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuth(!!authStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuth(false);
    window.location.href = "/"; 
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        
        {/* --- NAVIGATION BAR --- */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-green-600 p-2 rounded-lg">
                  <span className="text-white text-xl">♻️</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-green-800">CleanQuest</span>
              </Link>

              {/* Links Container */}
              <div className="flex items-center space-x-4">
                
                {/* --- CITIZEN ZONE --- */}
                <Link to="/" className="text-sm font-medium text-gray-700 hover:text-green-600">
                  Citizen Home
                </Link>
                <Link to="/tracker" className="text-sm font-medium text-gray-700 hover:text-green-600">
                  Track Issue
                </Link>
                {/* Inside the nav container, near Track Issue */}
<Link to="/leaderboard" className="text-sm font-medium text-gray-700 hover:text-green-600 flex items-center gap-1">
  <span>🏆</span> City Heroes
</Link>

                {/* --- DIVIDER --- */}
                {/* This vertical line separates Citizens from Admins */}
                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                {/* --- OFFICIALS ZONE --- */}
                {isAuth ? (
                   <button 
                     onClick={handleLogout} 
                     className="px-3 py-2 rounded text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
                   >
                     Logout
                   </button>
                ) : (
                   <div className="flex items-center gap-2">
                     {/* Label for clarity */}
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:block">
                       Officials:
                     </span>
                     
                     <Link 
                       to="/signup" 
                       className="text-sm font-medium text-gray-500 hover:text-green-600 px-2"
                     >
                       Register
                     </Link>
                     <Link 
                       to="/login" 
                       className="px-4 py-2 rounded-md text-sm font-bold text-white bg-green-900 hover:bg-green-800 shadow-sm transition"
                     >
                       Login 🔒
                     </Link>
                   </div>
                )}
              </div>

            </div>
          </div>
        </nav>

        {/* --- ROUTES --- */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Routes>

      </div>
    </Router>
  );
}

export default App;