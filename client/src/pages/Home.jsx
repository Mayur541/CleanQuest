import { useState, useEffect } from 'react';
import { api } from '../api'; // Uses your centralized API
import { Link } from 'react-router-dom';

function Home() {
  const [citizenName, setCitizenName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);
  const [recentReports, setRecentReports] = useState([]);

  // Fetch recent reports on load
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await api.get('/api/complaints');
        // Show only the last 3 reports
        setRecentReports(res.data.slice(-3).reverse());
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchRecent();
  }, []);

  // 1. Get GPS Location
  const handleGetLocation = (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("Location attached! 📍");
      },
      (error) => {
        alert("Unable to retrieve location. Please allow GPS access.");
      }
    );
  };

  // 2. Handle Image Upload (Converts to Base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert("Please click 'Attach Location' first!");
    if (!image) return alert("Please take a photo of the issue.");

    setLoading(true);
    const complaintData = {
      citizenName,
      description,
      location,
      imageUrl: image,
      status: "Pending" // Default status
    };

    try {
      const res = await api.post('/api/complaints', complaintData);
      setSubmittedId(res.data._id);
      
      // Reset Form
      setCitizenName('');
      setDescription('');
      setImage('');
      setLocation(null);
      
      // Refresh recent list
      const updatedList = await api.get('/api/complaints');
      setRecentReports(updatedList.data.slice(-3).reverse());
      
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* --- HEADER --- */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-green-900 tracking-tight sm:text-5xl mb-4">
            Spot it. Report it. <span className="text-green-600">Fixed.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help keep our city clean. Snap a photo of waste or hazards, and our municipal team will take action.
          </p>
        </div>

        {/* --- MAIN FORM CARD --- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            
            {submittedId ? (
              // SUCCESS MESSAGE VIEW
              <div className="text-center py-10">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h3>
                <p className="text-gray-500 mb-6">Your Complaint ID is:</p>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-lg font-bold select-all mb-8">
                  {submittedId}
                </div>
                <button 
                  onClick={() => setSubmittedId(null)}
                  className="text-green-600 font-bold hover:underline"
                >
                  Submit Another Report
                </button>
              </div>
            ) : (
              // FORM VIEW
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* GRID LAYOUT: 
                   - On Mobile (default): 1 Column (Everything stacked)
                   - On Laptop (md): 2 Columns for inputs, full width for description 
                */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LEFT SIDE: Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        className="input input-bordered w-full bg-gray-50 focus:bg-white transition" 
                        placeholder="John Doe"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <button 
                        onClick={handleGetLocation}
                        className={`btn w-full ${location ? 'btn-success text-white' : 'btn-outline btn-success'}`}
                      >
                        {location ? '📍 Location Attached' : '📍 Detect My GPS'}
                      </button>
                      {location && <p className="text-xs text-green-600 mt-1 text-center">Coordinates locked.</p>}
                    </div>
                  </div>

                  {/* RIGHT SIDE: Camera/Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Photo</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition h-full flex flex-col justify-center">
                      <input 
                        type="file" 
                        accept="image/*"
                        capture="environment" /* <--- OPENS CAMERA ON MOBILE */
                        onChange={handleImageUpload}
                        className="file-input file-input-bordered file-input-sm w-full max-w-xs mx-auto mb-2" 
                      />
                      {image ? (
                        <img src={image} alt="Preview" className="h-32 w-full object-cover rounded-md mx-auto" />
                      ) : (
                        <p className="text-xs text-gray-400">Tap to snap a picture</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* DESCRIPTION (Always Full Width) */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows="3"
                    className="textarea textarea-bordered w-full text-base bg-gray-50 focus:bg-white"
                    placeholder="Describe the waste or hazard location..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`btn w-full text-lg font-bold text-white shadow-md ${loading ? 'btn-disabled bg-gray-400' : 'bg-green-600 hover:bg-green-700 border-none'}`}
                >
                  {loading ? 'Uploading Report...' : 'Submit Report 🚀'}
                </button>

              </form>
            )}
          </div>
        </div>

        {/* --- RECENT ACTIVITY SECTION --- */}
        <div className="pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Live Community Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentReports.map((report) => (
              <div key={report._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="h-40 bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {report.imageUrl && (
                    <img src={report.imageUrl} alt="issue" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`badge ${report.status === 'Resolved' ? 'badge-success text-white' : 'badge-warning text-white'}`}>
                    {report.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 font-medium text-sm line-clamp-2">{report.description}</p>
                <div className="mt-3 text-xs text-gray-400 flex items-center gap-1">
                   <span>👤</span> {report.citizenName}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;