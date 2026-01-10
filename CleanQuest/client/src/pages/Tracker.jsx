// client/src/pages/Tracker.jsx
import { useState, useEffect } from 'react';
import { api } from '../api';

function Tracker() {
  const [trackId, setTrackId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [recentReports, setRecentReports] = useState([]);
  
  // --- NEW: Loading State ---
  const [loading, setLoading] = useState(false);

  // 1. Load History on Mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('myCleanQuestReports') || '[]');
    setRecentReports(saved);
  }, []);

  const handleTrack = async (e, idOverride = null) => {
    if (e) e.preventDefault();
    
    const idToSearch = idOverride || trackId.trim();
    
    setError('');
    setComplaint(null);
    if (idOverride) setTrackId(idOverride);

    if (!idToSearch) {
      setError("Please enter a valid ID");
      return;
    }

    // --- START LOADING ---
    setLoading(true);

    try {
      const res = await api.get(`/api/complaints/${idToSearch}`);
      // Add a tiny artificial delay (500ms) so the user actually SEES the spinner
      // (Optional, but feels nicer than a flickery instant load)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setComplaint(res.data);
    } catch (err) {
      console.error("Tracking Error:", err);
      setError("❌ Complaint not found. Please check your ID.");
    } finally {
      // --- STOP LOADING (Always runs, success or fail) ---
      setLoading(false);
    }
  };

  const getStepClass = (stepStatus) => {
    if (!complaint) return "";
    const statusOrder = ["Pending", "In Progress", "Resolved"];
    const currentIdx = statusOrder.indexOf(complaint.status);
    const stepIdx = statusOrder.indexOf(stepStatus);
    if (currentIdx >= stepIdx) return "step-primary"; 
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Live Status Tracker</h1>
        <p className="text-gray-500">Enter your Complaint ID or select from history.</p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <form onSubmit={handleTrack} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Paste ID here..." 
            className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            disabled={loading} // Disable input while loading
          />
          
          <button 
            type="submit" 
            disabled={loading} // Disable button while loading
            className={`px-6 py-3 rounded-lg font-bold text-white transition flex items-center justify-center min-w-[100px]
              ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
            `}
          >
            {loading ? (
              // Simple SVG Spinner
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Track"
            )}
          </button>
        </form>
        {error && <p className="text-red-500 mt-3 text-sm font-semibold">{error}</p>}

        {/* HISTORY SECTION */}
        {recentReports.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Your Recent Reports</p>
            <div className="space-y-2">
              {recentReports.map((report) => (
                <button 
                  key={report.id}
                  onClick={(e) => handleTrack(e, report.id)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-green-50 hover:text-green-700 transition flex justify-between items-center group disabled:opacity-50"
                >
                  <div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-green-800 block">
                      {report.date}
                    </span>
                    <span className="text-xs text-gray-500 truncate block max-w-[200px]">
                      ID: {report.id}
                    </span>
                  </div>
                  <span className="text-xs bg-white border px-2 py-1 rounded text-gray-500 group-hover:border-green-200">
                    Check Status →
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESULT CARD */}
      {complaint && (
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl border border-green-50 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <img src={complaint.imageUrl} alt="Report" className="w-full h-48 object-cover rounded-lg shadow-md mb-4" />
              <h3 className="font-bold text-lg text-gray-800">Report Details</h3>
              <p className="text-gray-600 text-sm mt-1">{complaint.description}</p>
              <p className="text-gray-400 text-xs mt-2">ID: {complaint._id}</p>
            </div>
            <div className="w-full md:w-2/3 flex flex-col justify-center">
              <ul className="steps steps-vertical lg:steps-horizontal w-full">
                <li className={`step ${getStepClass("Pending")}`}>Received</li>
                <li className={`step ${getStepClass("In Progress")}`}>In Progress</li>
                <li className={`step ${getStepClass("Resolved")}`}>Resolved</li>
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