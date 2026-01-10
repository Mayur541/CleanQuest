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

// Helper component for Links
const NavLink = ({ to, children, onClick, className }) => (
  <Link to={to} onClick={onClick} className={`block px-3 py-2 rounded-md text-base font-medium transition ${className}`}>
    {children}
  </Link>
);

// --- SEPARATE COMPONENT FOR CONTENT TO USE 'useLocation' ---
function AppContent() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuthenticated") === "true");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Theme State for Global Navbar
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Toggle Dark Mode
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  // Ensure theme loads on mount
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuth(false);
    window.location.href = "/";
  };

  const location = useLocation();
  // Hide this Global Navbar on the Home Page because Home.jsx has its own fancy one
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500">
      
      {/* --- GLOBAL NAVIGATION BAR (Hidden on Home Page) --- */}
      {!isHomePage && (
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                <div className="bg-green-600 p-2 rounded-lg">
                  <span className="text-white text-xl">♻️</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-green-800 dark:text-green-400">CleanQuest</span>
              </Link>

              {/* DESKTOP MENU */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">Home</Link>
                <Link to="/tracker" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">Track Issue</Link>
                <Link to="/leaderboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">🏆 Heroes</Link>
                
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>

                {isAuth ? (
                   <div className="flex items-center gap-3">
                     <Link to="/admin" className="text-sm font-bold text-green-700 dark:text-green-400 hover:text-green-900">Dashboard</Link>
                     <button onClick={handleLogout} className="px-3 py-2 rounded text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition">Logout</button>
                   </div>
                ) : (
                   <div className="flex items-center gap-2">
                     <Link to="/signup" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-600 px-2">Register</Link>
                     <Link to="/login" className="px-4 py-2 rounded-md text-sm font-bold text-white bg-green-900 hover:bg-green-800 shadow-sm">Login 🔒</Link>
                   </div>
                )}
              </div>

              {/* MOBILE MENU BUTTON */}
              <div className="md:hidden flex items-center gap-4">
                <button onClick={toggleTheme} className="text-lg">
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-green-600 focus:outline-none">
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
            <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-2 pt-2 pb-3 space-y-1 shadow-lg transition-colors duration-300">
              <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Home</NavLink>
              <NavLink to="/tracker" onClick={() => setIsMenuOpen(false)} className="text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Track Issue</NavLink>
              <NavLink to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">🏆 City Heroes</NavLink>
              
              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
              
              {isAuth ? (
                <>
                  <NavLink to="/admin" onClick={() => setIsMenuOpen(false)} className="text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20">Dashboard</NavLink>
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">Logout</button>
                </>
              ) : (
                <>
                  <NavLink to="/signup" onClick={() => setIsMenuOpen(false)} className="text-gray-500 dark:text-gray-400">Staff Register</NavLink>
                  <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className="bg-green-600 text-white hover:bg-green-700">Login</NavLink>
                </>
              )}
            </div>
          )}
        </nav>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

// WRAP APPCONTENT IN ROUTER
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;