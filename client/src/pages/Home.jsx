import { useState, useEffect, useRef } from 'react';
import { api } from '../api'; 
import { Link } from 'react-router-dom';
import Features from '../components/Features'; 

// --- HELPER: DROPDOWN FOR HOME ---
const NavDropdown = ({ label, items, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 focus:outline-none">
        {label} <span className="text-xs">▼</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-100 dark:border-gray-700 z-50">
          {items.map((item, idx) => (
            <Link key={idx} to={item.to} onClick={() => { setIsOpen(false); if(closeMenu) closeMenu(); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuthenticated") === "true");
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuth(false);
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
    <nav className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="bg-green-600 p-2 rounded-lg"><span className="text-white text-xl">♻️</span></div>
            <span className="font-bold text-xl tracking-tight text-green-800 dark:text-green-400">CleanQuest</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Home</Link>
            <Link to="/tracker" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">Track Issue</Link>
            <Link to="/leaderboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">🏆 Heroes</Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>
            {isAuth ? (
               <div className="flex items-center gap-3">
                 <Link to="/admin" className="text-sm font-bold text-green-700 dark:text-green-400 hover:text-green-900">Dashboard</Link>
                 <button onClick={handleLogout} className="px-3 py-2 rounded text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
               </div>
            ) : (
               <div className="flex items-center gap-4">
                 <NavDropdown label="Register" items={[{ label: "User", to: "/signup/user" }, { label: "Admin", to: "/signup/admin" }]} />
                 <NavDropdown label="Login 🔒" items={[{ label: "User", to: "/login/user" }, { label: "Admin", to: "/login/admin" }]} />
               </div>
            )}
            <ThemeToggleSlider />
          </div>

          <div className="md:hidden flex items-center gap-4">
            <ThemeToggleSlider />
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 hover:text-green-600 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">Home</Link>
          <Link to="/tracker" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">Track Issue</Link>
          <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 dark:text-gray-200">🏆 City Heroes</Link>
          <div className="border-t border-gray-100 dark:border-gray-800 my-2"></div>
          {isAuth ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600">Logout</button>
          ) : (
            <div className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
               <p className="text-xs text-gray-400 font-bold uppercase">Register</p>
               <Link to="/signup/user" className="block text-sm dark:text-white" onClick={() => setIsOpen(false)}>User</Link>
               <Link to="/signup/admin" className="block text-sm dark:text-white" onClick={() => setIsOpen(false)}>Admin</Link>
               <p className="text-xs text-gray-400 font-bold uppercase mt-2">Login</p>
               <Link to="/login/user" className="block text-sm dark:text-white" onClick={() => setIsOpen(false)}>User</Link>
               <Link to="/login/admin" className="block text-sm dark:text-white" onClick={() => setIsOpen(false)}>Admin</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

function Home() {
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState("");
  const [submittedId, setSubmittedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      }, () => { alert("Unable to retrieve location. Please allow GPS access."); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } else { alert("Geolocation is not supported by this browser."); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) { alert("Please select a valid image file."); return; }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const MAX_WIDTH = 800; const MAX_HEIGHT = 800;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
          else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setImage(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert("Please click 'Get My Location' first!");
    if (!image) return alert("Please take a photo of the issue.");

    setLoading(true); 
    const complaintData = { citizenName, description, location, imageUrl: image };

    try {
      const res = await api.post('/api/complaints', complaintData);
      const newReport = { id: res.data._id, date: new Date().toLocaleDateString() };
      const existingHistory = JSON.parse(localStorage.getItem('myCleanQuestReports') || '[]');
      localStorage.setItem('myCleanQuestReports', JSON.stringify([newReport, ...existingHistory]));
      setSubmittedId(res.data._id);
      setCitizenName(''); setDescription(''); setLocation(null); setImage("");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) alert(error.response.data.error); 
      else alert('Error submitting complaint ❌'); 
    } finally {
      setLoading(false);
    }
  };

  if (submittedId) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-green-500 animate-fade-in-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Complaint Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Thank you for helping keep our city clean.</p>
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Your Tracking ID</p>
            <p className="text-xl font-mono font-bold text-green-700 dark:text-green-400 select-all">{submittedId}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">(Copy this ID to track status)</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link to="/tracker" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow">Track Now 🚀</Link>
            <button onClick={() => setSubmittedId(null)} className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-300">Submit Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar /> 
      <section className="bg-green-50 dark:bg-gray-800 text-center pt-20 pb-32 px-4 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-semibold px-3 py-1 rounded-full uppercase tracking-wide">Community Cleanup</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mt-6 mb-6">Make Your City <span className="text-green-600 dark:text-green-400">Cleaner</span>, Together.</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">Spot trash? Don't ignore it. Report it. Join thousands of citizens making a difference today.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => document.getElementById('report-form').scrollIntoView({ behavior: 'smooth' })} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg">Report Now 👇</button>
            <Link to="/tracker" className="bg-white dark:bg-gray-700 text-gray-700 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow border border-gray-200 dark:border-gray-600">Track Issue</Link>
          </div>
        </div>
      </section>
      <Features />
      <section id="report-form" className="py-20 px-4 bg-green-50 dark:bg-gray-800 transition-colors duration-300"> 
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Submit a Report</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Fill in the details below to alert our municipal team.</p>
        </div>
        <div className="w-full md:max-w-3xl mx-auto bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative z-10 transition-colors duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                  <input type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-blue-50 dark:bg-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition" value={citizenName} onChange={(e) => setCitizenName(e.target.value)} required disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <button type="button" onClick={getLocation} disabled={loading} className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 border ${location ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"}`}>{location ? (<><span>📍</span> Location Saved</>) : (<><span>📍</span> Get My Location</>)}</button>
                  {location && <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">Coordinates locked.</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Photo</label>
                <div className={`border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 h-full flex flex-col justify-center items-center transition ${loading ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} disabled={loading} className="file-input file-input-bordered file-input-success w-full max-w-xs mb-3 dark:bg-gray-800 dark:text-white dark:border-gray-700" />
                  {image ? (<img src={image} alt="Preview" className="w-full h-32 object-cover rounded-lg shadow-sm" />) : (<p className="text-xs text-gray-400 dark:text-gray-500">Tap to take a picture</p>)}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Description</label>
              <textarea placeholder="Describe the waste location and type..." className="w-full px-4 py-3 bg-blue-50 dark:bg-gray-800 dark:text-white rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition h-32 resize-none" value={description} onChange={(e) => setDescription(e.target.value)} required disabled={loading} />
            </div>
            <button type="submit" disabled={loading} className={`w-full font-bold py-4 rounded-lg shadow-lg transition duration-300 flex items-center justify-center gap-2 ${loading ? 'bg-green-400 dark:bg-green-700 cursor-not-allowed transform-none text-white opacity-80' : 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 hover:shadow-xl hover:-translate-y-1 text-white'}`}>{loading ? (<><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Submitting...</span></>) : ('Submit Complaint 🚀')}</button>
          </form>
        </div>
      </section>
      <section className="py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <p>© 2025 CleanQuest. Building better cities.</p>
      </section>
    </div>
  );
}
export default Home;