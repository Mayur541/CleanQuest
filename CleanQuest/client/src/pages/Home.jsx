// client/src/pages/Home.jsx
import { useState } from 'react';
import { api } from '../api'; 
import { Link } from 'react-router-dom';
import Features from '../components/Features'; 

function Home() {
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState("");
  const [submittedId, setSubmittedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

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
      email,
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

      // alert("Complaint Registered!"); // Removed alert to make UI smoother
      
      setSubmittedId(res.data._id);
      setCitizenName('');
      setDescription('');
      setLocation(null);
      setImage("");
    } catch (error) {
      console.error(error);
      alert('Error submitting complaint ❌');
    } finally {
      setLoading(false); // <--- STOP SPINNER
    }
  };

  // SUCCESS STATE (Post-submission)
  // --- SUCCESS STATE RETURN BLOCK ---
  if (submittedId) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-green-500 animate-fade-in-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-600 mb-4">Thank you for helping keep our city clean.</p>
          
          {/* NEW: Email Confirmation Message */}
          {email && (
             <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-100 flex items-center justify-center gap-2">
               <span>📧</span>
               <span>We'll notify <strong>{email}</strong> upon resolution.</span>
             </div>
          )}

          <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Tracking ID</p>
            <p className="text-xl font-mono font-bold text-green-700 select-all">{submittedId}</p>
            <p className="text-xs text-gray-400 mt-2">(Copy this ID to track status)</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/tracker" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow flex items-center gap-2">
              Track Now 🚀
            </Link>
            <button 
              onClick={() => {
                setSubmittedId(null);
                // Optional: Clear email here if you want to reset it for the next submission
                // setEmail(''); 
              }} 
              className="text-gray-500 font-medium hover:text-gray-700 px-4 py-3"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  // MAIN PAGE LAYOUT
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- HERO BANNER --- */}
      <section className="bg-green-50 text-center pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Community Cleanup
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-6 mb-6">
            Make Your City <span className="text-green-600">Cleaner</span>, Together.
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Spot trash? Don't ignore it. Report it. Join thousands of citizens making a difference today.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => document.getElementById('report-form').scrollIntoView({ behavior: 'smooth' })} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg">
              Report Now 👇
            </button>
            <Link to="/tracker" className="bg-white text-gray-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition shadow border border-gray-200">
              Track Issue
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <Features />

      {/* --- THE FORM SECTION --- */}
      <section id="report-form" className="py-20 px-4 bg-green-50"> 
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Submit a Report</h2>
          <p className="text-gray-500 mt-2">Fill in the details below to alert our municipal team.</p>
        </div>

        {/* Form Container */}
        <div className="w-full md:max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT COLUMN: Name & Location */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full px-4 py-3 bg-blue-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <button 
                    type="button" 
                    onClick={getLocation}
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 border ${
                      location 
                      ? "bg-blue-50 text-blue-600 border-blue-200" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
                    }`}
                  >
                    {location ? (
                      <><span>📍</span> Location Saved</>
                    ) : (
                      <><span>📍</span> Get My Location</>
                    )}
                  </button>
                  {location && <p className="text-xs text-green-600 mt-1 text-center">Coordinates locked.</p>}
                </div>
              </div>

              {/* RIGHT COLUMN: Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo</label>
                <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 h-full flex flex-col justify-center items-center transition ${loading ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    disabled={loading}
                    className="file-input file-input-bordered file-input-success w-full max-w-xs mb-3" 
                  />
                  {image ? (
                    <img src={image} alt="Preview" className="w-full h-32 object-cover rounded-lg shadow-sm" />
                  ) : (
                    <p className="text-xs text-gray-400">Tap to take a picture</p>
                  )}
                </div>
              </div>

            </div>

            {/* FULL WIDTH ROW: Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
              <textarea 
                placeholder="Describe the waste location and type..." 
                className="w-full px-4 py-3 bg-blue-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition h-32 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* --- UPDATED SUBMIT BUTTON (WITH SPINNER) --- */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full font-bold py-4 rounded-lg shadow-lg transition duration-300 flex items-center justify-center gap-2
                ${loading 
                  ? 'bg-green-400 cursor-not-allowed transform-none text-white opacity-80' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-1 text-white'
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
      <section className="py-12 text-center text-gray-500 bg-white border-t border-gray-100">
        <p>© 2025 CleanQuest. Building better cities.</p>
      </section>

    </div>
  );
}

export default Home;