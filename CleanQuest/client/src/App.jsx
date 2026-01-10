// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import logo from './assets/logo.png'; // Make sure you have this or revert to emoji

// Helper component to close menu when a link is clicked
const NavLink = ({ to, children, onClick, className }) => (
  <Link to={to} onClick={onClick} className={`block px-3 py-2 rounded-md text-base font-medium transition ${className}`}>
    {children}
  </Link>
);

function App() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuthenticated") === "true");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for Mobile Menu

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
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <div className="bg-green-600 p-2 rounded-lg">
                  <span className="text-white text-xl">♻️</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-green-800">CleanQuest</span>
              </Link>

              {/* DESKTOP MENU (Hidden on Mobile) */}
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className="text-sm font-medium text-gray-700 hover:text-green-600">Home</Link>
                <Link to="/tracker" className="text-sm font-medium text-gray-700 hover:text-green-600">Track Issue</Link>
                <Link to="/leaderboard" className="text-sm font-medium text-gray-700 hover:text-green-600">🏆 Heroes</Link>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>

                {isAuth ? (
                   <div className="flex items-center gap-3">
                     <Link to="/admin" className="text-sm font-bold text-green-700 hover:text-green-900">Dashboard</Link>
                     <button onClick={handleLogout} className="px-3 py-2 rounded text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50">Logout</button>
                   </div>
                ) : (
                   <div className="flex items-center gap-2">
                     <Link to="/signup" className="text-sm font-medium text-gray-500 hover:text-green-600 px-2">Register</Link>
                     <Link to="/login" className="px-4 py-2 rounded-md text-sm font-bold text-white bg-green-900 hover:bg-green-800 shadow-sm">Login 🔒</Link>
                   </div>
                )}
              </div>

              {/* MOBILE MENU BUTTON (Visible only on small screens) */}
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="text-gray-600 hover:text-green-600 focus:outline-none"
                >
                  {/* Hamburger Icon */}
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* MOBILE MENU DROPDOWN */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-2 pt-2 pb-3 space-y-1 shadow-lg">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-gray-50">Home</NavLink>
              <NavLink to="/tracker" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-gray-50">Track Issue</NavLink>
              <NavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:bg-gray-50">🏆 City Heroes</NavLink>
              
              <div className="border-t border-gray-100 my-2"></div>
              
              {isAuth ? (
                <>
                  <NavLink to="/admin" onClick={() => setIsMenuOpen(false)} className="text-green-700 bg-green-50">Dashboard</NavLink>
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/signup" onClick={() => setIsMenuOpen(false)} className="text-gray-500">Staff Register</NavLink>
                  <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="bg-green-600 text-white hover:bg-green-700">Login</NavLink>
                </>
              )}
            </div>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;