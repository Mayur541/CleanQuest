import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Tracker from './pages/Tracker';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Stats from './pages/Stats';

// --- HELPER: DROPDOWN COMPONENT ---
const NavDropdown = ({ label, items, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 focus:outline-none"
      >
        {label} <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700 z-50">
          {items.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              onClick={() => { setIsOpen(false); if (closeMenu) closeMenu(); }}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

function AppContent() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuthenticated") === "true");
  // --- NEW: Track User Role to hide Admin Button ---
  const [userRole, setUserRole] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser).role : null;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    setIsAuth(false);
    setUserRole(null);
    window.location.href = "/";
  };

  const ThemeToggleSlider = () => (
    <div onClick={toggleTheme} className="relative w-14 h-7 flex items-center cursor-pointer bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 shadow-inner ml-2">
      <div className="absolute left-1.5 text-[10px]">☀️</div>
      <div className="absolute right-1.5 text-[10px]">🌙</div>
      <div className={`bg-white dark:bg-gray-800 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 z-10 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500">

      {!isHomePage && (
        <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">

              <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                {/* YOUR NEW LOGO */}
                <img src="/logo.png" alt="CleanQuest" className="h-10 w-auto object-contain" />
                <span className="font-bold text-xl tracking-tight text-green-800 dark:text-green-400">CleanQuest</span>
              </Link>

              {/* DESKTOP MENU */}
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">Home</Link>
                <Link to="/tracker" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">Track Issue</Link>
                <Link to="/leaderboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">🏆 Heroes</Link>
                <Link to="/stats" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">Analytics</Link>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                {isAuth ? (
                  <div className="flex items-center gap-3">
                    <Link to="/profile" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">
                      👤 My Profile
                    </Link>

                    {/* --- ONLY SHOW ADMIN BUTTON IF ROLE IS ADMIN --- */}
                    {userRole === 'admin' && (
                      <Link to="/admin" className="text-sm font-bold text-green-700 dark:text-green-400 hover:text-green-900 border border-green-200 px-3 py-1 rounded-md">
                        Admin Panel
                      </Link>
                    )}

                    <button onClick={handleLogout} className="px-3 py-2 rounded text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 transition">Logout</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <NavDropdown
                      label="Register"
                      items={[
                        { label: "User Register", to: "/signup/user" },
                        { label: "Admin Register", to: "/signup/admin" }
                      ]}
                    />
                    <NavDropdown
                      label="Login 🔒"
                      items={[
                        { label: "User Login", to: "/login/user" },
                        { label: "Admin Login", to: "/login/admin" }
                      ]}
                    />
                  </div>
                )}
                <ThemeToggleSlider />
              </div>

              {/* MOBILE MENU TOGGLE */}
              <div className="md:hidden flex items-center gap-4">
                <ThemeToggleSlider />
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-green-600 focus:outline-none">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMenuOpen ? (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />) : (<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />)}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE MENU DROPDOWN */}
          {isMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-2 pb-4 space-y-2 shadow-lg">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">Home</Link>
              <Link to="/tracker" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">Track Issue</Link>
              <Link to="/leaderboard" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">🏆 Heroes</Link>
              <Link to="/stats" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600">Analytics</Link>
              <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>

              {isAuth ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">👤 My Profile</Link>

                  {/* --- MOBILE: ONLY SHOW ADMIN LINK IF ADMIN --- */}
                  {userRole === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-green-600 font-bold">Admin Dashboard</Link>
                  )}

                  <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Logout</button>
                </>
              ) : (
                <div className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-400 uppercase font-bold">Register</p>
                  <Link to="/signup/user" onClick={() => setIsMenuOpen(false)} className="block text-sm dark:text-gray-300">User Signup</Link>
                  <Link to="/signup/admin" onClick={() => setIsMenuOpen(false)} className="block text-sm dark:text-gray-300">Admin Signup</Link>

                  <p className="text-xs text-gray-400 uppercase font-bold mt-4">Login</p>
                  <Link to="/login/user" onClick={() => setIsMenuOpen(false)} className="block text-sm dark:text-gray-300">User Login</Link>
                  <Link to="/login/admin" onClick={() => setIsMenuOpen(false)} className="block text-sm dark:text-gray-300">Admin Login</Link>
                </div>
              )}
            </div>
          )}
        </nav>
      )}

      <Routes>
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/stats" element={<Stats />} />

        {/* Profile is protected for any logged in user */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* --- SPLIT AUTH ROUTES --- */}
        <Route path="/signup/user" element={<Signup role="user" />} />
        <Route path="/signup/admin" element={<Signup role="admin" />} />
        <Route path="/login/user" element={<Login role="user" />} />
        <Route path="/login/admin" element={<Login role="admin" />} />

        {/* --- LOCKED ADMIN ROUTE --- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;