// client/src/pages/Tracker.jsx
import { useState } from 'react';
import { api } from '../api'; // <--- FIXED: Importing your configured API instance

function Tracker() {
  const [trackId, setTrackId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setComplaint(null);

    // 1. Clean the input (remove invisible spaces)
    const cleanId = trackId.trim();

    if (!cleanId) {
      setError("Please enter a valid ID");
      return;
    }

    try {
      // 2. Use the custom 'api' (which knows the correct Backend URL)
      const res = await api.get(`/api/complaints/${cleanId}`);
      setComplaint(res.data);
    } catch (err) {
      console.error("Tracking Error:", err); // Log error for debugging
      setError("❌ Complaint not found. Please check your ID.");
    }
  };

  // Helper to determine active step
  const getStepClass = (stepStatus) => {
    if (!complaint) return "";
    
    const statusOrder = ["Pending", "In Progress", "Resolved"];
    const currentIdx = statusOrder.indexOf(complaint.status);
    const stepIdx = statusOrder.indexOf(stepStatus);

    if (currentIdx >= stepIdx) return "step-primary"; // Completed or Active
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Live Status Tracker</h1>
        <p className="text-gray-500">Enter your Complaint ID to see real-time updates.</p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <form onSubmit={handleTrack} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Paste ID here (e.g. 65d4...)" 
            className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
          />
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition">
            Track
          </button>
        </form>
        {error && <p className="text-red-500 mt-3 text-sm font-semibold">{error}</p>}
      </div>

      {/* RESULT CARD */}
      {complaint && (
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl border border-green-50 animate-fade-in-up">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Left: Image & Info */}
            <div className="w-full md:w-1/3">
              <img 
                src={complaint.imageUrl} 
                alt="Report" 
                className="w-full h-48 object-cover rounded-lg shadow-md mb-4" 
              />
              <h3 className="font-bold text-lg text-gray-800">Report Details</h3>
              <p className="text-gray-600 text-sm mt-1">{complaint.description}</p>
              <p className="text-gray-400 text-xs mt-2">ID: {complaint._id}</p>
            </div>

            {/* Right: THE TRACKER (DaisyUI Steps) */}
            <div className="w-full md:w-2/3 flex flex-col justify-center">
              
              <ul className="steps steps-vertical lg:steps-horizontal w-full">
                
                {/* Step 1 */}
                <li className={`step ${getStepClass("Pending")}`}>
                  <div className="text-left md:text-center ml-2 md:ml-0">
                    <p className="font-bold">Received</p>
                    <span className="text-xs text-gray-500">We got your report</span>
                  </div>
                </li>

                {/* Step 2 */}
                <li className={`step ${getStepClass("In Progress")}`}>
                  <div className="text-left md:text-center ml-2 md:ml-0">
                    <p className="font-bold">In Progress</p>
                    <span className="text-xs text-gray-500">Team dispatched</span>
                  </div>
                </li>

                {/* Step 3 */}
                <li className={`step ${getStepClass("Resolved")}`}>
                  <div className="text-left md:text-center ml-2 md:ml-0">
                    <p className="font-bold">Resolved</p>
                    <span className="text-xs text-gray-500">Area Cleaned!</span>
                  </div>
                </li>

              </ul>

              <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 text-sm font-medium text-center">
                  Current Status: <span className="font-bold uppercase">{complaint.status}</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default Tracker;