// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Simple Navbar */}
        <nav className="bg-green-600 p-4 text-white flex justify-between">
          <h1 className="font-bold text-xl">Clean Quest</h1>
          <div>
            <Link to="/" className="mr-4">Report Issue</Link>
            <Link to="/admin">Admin Login</Link>
          </div>
        </nav>

        {/* Page Content */}
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;