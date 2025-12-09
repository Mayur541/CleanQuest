import { useState } from 'react';
import axios from 'axios';


function Home() {
  // --- 1. LOGIC SECTION (Your existing code) ---
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [location, setLocation] = useState(null);
  
  // Function to get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        alert("Location Fetched! 📍");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Function to submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create the data object to send
    const complaintData = {
      citizenName,
      description,
      location,
      imageUrl: "https://via.placeholder.com/150" // Placeholder for now!
    };

    try {
      // Send to Backend
      await axios.post('http://localhost:5000/api/complaints', complaintData);
      alert('Complaint Submitted Successfully! ✅');
      // Optional: Clear form after submit
      setCitizenName('');
      setDescription('');
      setLocation(null);
    } catch (error) {
      console.error(error);
      alert('Error submitting complaint ❌');
    }
  };

  // --- 2. DESIGN SECTION (The new Look) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
    
      {/* --- HERO BANNER --- */}
      <section className="bg-green-50 text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <span className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            Community Cleanup
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-6 mb-6">
            Make Your City <span className="text-green-600">Cleaner</span>, Together.
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Spot trash? Don't ignore it. Report it. Join thousands of citizens making a difference in their neighborhood today.
          </p>
        </div>
      </section>

      {/* --- THE FORM SECTION --- */}
      <section className="py-10 px-4 -mt-10 bg-green-100"> 
        <div className="w-full md:max-w-lg mx-auto bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-gray-100 relative z-10">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Submit a Report</h2>
            <p className="text-gray-500 text-sm">Fill in the details below to alert our team.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-4 py-3 bg-blue-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Description</label>
              <textarea 
                placeholder="Describe the waste location and type..." 
                className="w-full px-4 py-3 bg-blue-100 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition h-32 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Location Button */}
            <button 
              type="button" 
              onClick={getLocation}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 border ${
                location 
                ? "bg-blue-50 text-blue-600 border-blue-200" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200"
              }`}
            >
              {location ? (
                <>
                  <span>📍</span> Location Saved (Lat: {location.lat.toFixed(2)})
                </>
              ) : (
                <>
                  <span>📍</span> Get My Location
                </>
              )}
            </button>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
            >
              Submit Complaint
            </button>
            
          </form>

        </div>
      </section>

      {/* --- STATS SECTION (Optional Footer Info) --- */}
      <section className="py-12 text-center text-gray-500">
        <p>© 2024 CleanQuest. Building better cities.</p>
      </section>

    </div>
  );
}

export default Home;