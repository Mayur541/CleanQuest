// client/src/pages/Home.jsx
import { useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import Features from '../components/Features'; // <--- IMPORT THIS

function Home() {
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState("");
  const [submittedId, setSubmittedId] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const complaintData = {
      citizenName,
      description,
      location,
      imageUrl: image || "https://via.placeholder.com/150" 
    };

    try {
      const res = await api.post('/api/complaints', complaintData);
      setSubmittedId(res.data._id);
      setCitizenName('');
      setDescription('');
      setLocation(null);
      setImage("");
    } catch (error) {
      console.error(error);
      alert('Error submitting complaint ❌');
    }
  };

  // SUCCESS STATE (Post-submission)
  if (submittedId) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-green-500">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for helping keep our city clean.</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Your Tracking ID</p>
            <p className="text-xl font-mono font-bold text-green-700 select-all">{submittedId}</p>
            <p className="text-xs text-gray-400 mt-2">(Copy this ID to track status)</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/tracker" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow">
              Track Now 🚀
            </Link>
            <button onClick={() => setSubmittedId(null)} className="text-gray-500 font-medium hover:text-gray-700">
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

      {/* --- NEW FEATURES SECTION --- */}
      {/* This sits between the Hero and the Form */}
      <Features />

      {/* --- THE FORM SECTION --- */}
      <section id="report-form" className="py-20 px-4 bg-green-50"> 
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Submit a Report</h2>
          <p className="text-gray-500 mt-2">Fill in the details below to alert our municipal team.</p>
        </div>

        <div className="w-full md:max-w-lg mx-auto bg-white p-4 md:p-8 rounded-2xl shadow-xl border border-gray-100 relative z-10">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full px-4 py-3 bg-blue-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                required
              />
            </div>

            {/* Image Upload Input - OPTIMIZED FOR MOBILE */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Upload Photo
  </label>
  
  <input 
    type="file" 
    accept="image/*"
    capture="environment"  // <--- THE MAGIC LINE!
    onChange={handleImageUpload}
    className="file-input file-input-bordered file-input-success w-full bg-blue-50" 
  />

  {image && (
    <div className="mt-4">
      <p className="text-xs text-gray-500 mb-2">Preview:</p>
      <img src={image} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm border" />
    </div>
  )}
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
                <><span>📍</span> Location Saved (Lat: {location.lat.toFixed(2)})</>
              ) : (
                <><span>📍</span> Get My Location</>
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

      {/* --- FOOTER --- */}
      <section className="py-12 text-center text-gray-500 bg-white border-t border-gray-100">
        <p>© 2025 CleanQuest. Building better cities.</p>
      </section>

    </div>
  );
}

export default Home;