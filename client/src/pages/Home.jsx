import { useState } from 'react';
import { api } from '../api'; 
import { Link } from 'react-router-dom';

// --- NEW Navbar Component (Dark Mode Ready) ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuthenticated") === "true");

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuth(false);
    window.location.href = "/";
  };

  return (
    <nav className="bg-transparent py-4 px-6 md:px-12 fixed w-full z-50 top-0 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-white font-bold text-2xl hidden md:block drop-shadow-md">CleanQuest</Link>

      {/* Mobile Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white md:hidden focus:outline-none drop-shadow-md"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        <Link to="/leaderboard" className="text-white font-medium hover:underline drop-shadow-md">Champions</Link>
        <Link to="/tracker" className="text-white font-medium hover:underline drop-shadow-md">Track</Link>
        {!isAuth ? (
          <>
            <Link to="/login" className="text-white font-medium hover:underline drop-shadow-md">Log In</Link>
            <Link to="/signup" className="bg-white text-green-700 font-bold px-6 py-2 rounded-full hover:bg-green-50 transition shadow-lg">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/admin" className="text-white font-medium hover:underline drop-shadow-md">Dashboard</Link>
            <button onClick={handleLogout} className="text-white font-medium hover:underline drop-shadow-md">Log Out</button>
          </>
        )}
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-green-600 dark:bg-green-900 p-6 md:hidden flex flex-col space-y-4 rounded-b-3xl shadow-xl z-50 border-t border-green-500">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-white font-medium text-lg">Home</Link>
          <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="text-white font-medium text-lg">Champions</Link>
          <Link to="/tracker" onClick={() => setIsOpen(false)} className="text-white font-medium text-lg">Track Issue</Link>
          {!isAuth ? (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-white font-medium text-lg">Log In</Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="text-white font-medium text-lg">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/admin" onClick={() => setIsOpen(false)} className="text-white font-medium text-lg">Dashboard</Link>
              <button onClick={handleLogout} className="text-white font-medium text-lg text-left">Log Out</button>
            </>
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

  // 1. Get GPS Location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }, () => {
        alert("Unable to retrieve location. Please allow GPS access.");
      },
      {
          enableHighAccuracy: true, // Force GPS hardware (slower but accurate)
          timeout: 10000,           // Wait up to 10s for a good signal
          maximumAge: 0             // Don't accept old cached positions
        }
    );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // 2. Handle Image Upload (Resizes to max 800px width/height)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // 1. Basic Validation: Is it an image?
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
      }

      // 2. Create an Image Object
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          // 3. Calculate New Dimensions (Max 800px)
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Maintain Aspect Ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // 4. Create a Canvas to Draw the Resized Image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // 5. Export as Compressed JPEG (0.7 = 70% Quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // 6. Save to State
          setImage(dataUrl);
        };
      };
    }
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert("Please click 'Get My Location' first!");
    if (!image) return alert("Please take a photo of the issue.");

    setLoading(true); // <--- START SPINNER
    
    const complaintData = {
      citizenName,
      description,
      location,
      imageUrl: image
    };

    try {
      const res = await api.post('/api/complaints', complaintData);
      
      // --- Save to History ---
      const newReport = {
        id: res.data._id,
        date: new Date().toLocaleDateString(),
      };
      const existingHistory = JSON.parse(localStorage.getItem('myCleanQuestReports') || '[]');
      const updatedHistory = [newReport, ...existingHistory];
      localStorage.setItem('myCleanQuestReports', JSON.stringify(updatedHistory));
      // -----------------------
      
      setSubmittedId(res.data._id);
      setCitizenName('');
      setDescription('');
      setLocation(null);
      setImage("");
    } catch (error) {
      console.error(error);
      
      // --- THE FIX: Show the specific error from the backend ---
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error); // Shows: "⚠️ A report already exists..."
      } else {
        alert('Error submitting complaint ❌'); // Shows only if server crashes
      }
      // ---------------------------------------------------------
      
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STATE (Post-submission) - THEMED & DARK MODE
  if (submittedId) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex items-center justify-center p-4">
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
            <Link to="/tracker" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow">
              Track Now 🚀
            </Link>
            <button onClick={() => setSubmittedId(null)} className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-300">
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PAGE LAYOUT - THEMED & DARK MODE
  return (
    <div className="min-h-screen font-sans text-gray-900 dark:text-white bg-gradient-to-b from-green-400 to-green-100 dark:from-green-900 dark:to-gray-950 overflow-hidden transition-colors duration-300">
      
      <Navbar />

      {/* --- HERO BANNER --- */}
      <section className="pt-32 pb-20 px-6 text-center md:text-left">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight drop-shadow-lg">
              Saving the world,<br />
              <span className="text-green-800 dark:text-green-300">One photo at a time.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white mt-6 font-medium drop-shadow-md">
              Spot an issue? Report right now
            </p>
            <button
              onClick={() => document.getElementById('report-form').scrollIntoView({ behavior: 'smooth' })}
              className="mt-10 bg-green-600 dark:bg-green-500 text-white px-12 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-700 dark:hover:bg-green-400 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              SUBMIT REPORT
            </button>
          </div>
          <div className="hidden md:block"></div>
        </div>
      </section>

      {/* --- "HOW WE WORK" SECTION --- */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-green-50/80 dark:bg-gray-800/80 backdrop-blur-md p-8 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden transition-colors duration-300">
          <div className="text-center mb-16 relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 dark:text-green-400 drop-shadow-sm">How we work ?</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-4 relative z-10">
            {[
              { id: 1, title: "Click a Photo", desc: "Take a picture of the garbage", icon: "📸" },
              { id: 2, title: "Get GPS Location", desc: "Share your current location", icon: "📍" },
              { id: 3, title: "Fill Out Details", desc: "Provide additional information", icon: "📝" },
              { id: 4, title: "Submit Report", desc: "Send your report to us", icon: "✅" },
            ].map((step) => (
              <div key={step.id} className="relative group bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center border-b-4 border-green-500/0 hover:border-green-500/100">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center text-3xl mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.desc}</p>
                <div className="absolute top-3 right-3 text-6xl font-black text-green-500 opacity-10 select-none">
                  {step.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- "ABOUT US" SECTION --- */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 dark:text-green-300 mb-16 drop-shadow-sm underline decoration-green-400/50 underline-offset-8">
            About us
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { name: "Mayur" },
              { name: "Pranjal" },
              { name: "Pratiksha" },
              { name: "Aashutosh" },
            ].map((member) => (
              <div key={member.name} className="flex flex-col items-center group">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 dark:bg-gray-600 mb-4 shadow-lg overflow-hidden transition-transform transform group-hover:scale-105 border-4 border-white dark:border-gray-500">
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-500 animate-pulse"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">{member.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- THE FORM SECTION --- */}
      <section id="report-form" className="py-20 px-4 bg-green-50/50 dark:bg-gray-900/50 backdrop-blur-lg"> 
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Submit a Report</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Fill in the details below to alert our municipal team.</p>
        </div>

        {/* Form Container */}
        <div className="w-full md:max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative z-10 transition-colors duration-300">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT COLUMN: Name & Location (NO EMAIL) */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full px-4 py-3 bg-blue-50 dark:bg-gray-700 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <button 
                    type="button" 
                    onClick={getLocation}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 border ${
                      location 
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {location ? (
                      <><span>📍</span> Location Saved</>
                    ) : (
                      <><span>📍</span> Get My Location</>
                    )}
                  </button>
                  {location && <p className="text-xs text-green-600 dark:text-green-400 mt-1 text-center">Coordinates locked.</p>}
                </div>
              </div>

              {/* RIGHT COLUMN: Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Photo</label>
                <div className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 h-full flex flex-col justify-center items-center transition ${loading ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="file-input file-input-bordered file-input-success w-full max-w-xs mb-3 dark:bg-gray-700 dark:text-white" 
                  />
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Tap to take a picture</p>
                  )}
                </div>
              </div>

            </div>

            {/* FULL WIDTH ROW: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Description</label>
              <textarea 
                placeholder="Describe the waste location and type..." 
                className="w-full px-4 py-3 bg-blue-50 dark:bg-gray-700 dark:text-white rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition h-32 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* --- SUBMIT BUTTON (WITH SPINNER) --- */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full font-bold py-4 rounded-lg shadow-lg transition duration-300 flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-green-400 dark:bg-green-700 cursor-not-allowed transform-none text-white opacity-80' 
                  : 'bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 hover:shadow-xl hover:-translate-y-1 text-white'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Complaint 🚀'
              )}
            </button>
            
          </form>

        </div>
      </section>

      {/* --- FOOTER --- */}
      <section className="py-12 text-center text-white bg-green-800/90 dark:bg-green-950/90 backdrop-blur-md">
        <p>© 2025 CleanQuest. Building better cities.</p>
      </section>

    </div>
  );
}

export default Home;