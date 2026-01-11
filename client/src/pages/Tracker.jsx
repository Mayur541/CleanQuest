import { useState, useEffect } from 'react';
import { api } from '../api';

function Tracker() {
  const [trackId, setTrackId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [recentReports, setRecentReports] = useState([]);
  
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const res = await api.get(`/api/complaints/${idToSearch}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      setComplaint(res.data);
    } catch (err) {
      console.error("Tracking Error:", err);
      setError("❌ Complaint not found. Please check your ID.");
    } finally {
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
    // DARK MODE: Background
    <div className="min-h-screen bg-transparent p-8 transition-colors duration-300">
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Live Status Tracker</h1>
        <p className="text-gray-500 dark:text-gray-400">Enter your Complaint ID or select from history.</p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mb-8 transition-colors duration-300">
        <form onSubmit={handleTrack} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Paste ID here..." 
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            disabled={loading} 
          />
          
          <button 
            type="submit" 
            disabled={loading} 
            className={`px-6 py-3 rounded-lg font-bold text-white transition flex items-center justify-center min-w-[100px]
              ${loading ? 'bg-green-400 dark:bg-green-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500'}
            `}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Track"
            )}
          </button>
        </form>
        {error && <p className="text-red-500 dark:text-red-400 mt-3 text-sm font-semibold">{error}</p>}

        {/* HISTORY SECTION */}
        {recentReports.length > 0 && (
          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Your Recent Reports</p>
            <div className="space-y-2">
              {recentReports.map((report) => (
                <button 
                  key={report.id}
                  onClick={(e) => handleTrack(e, report.id)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 transition flex justify-between items-center group disabled:opacity-50"
                >
                  <div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-white group-hover:text-green-800 dark:group-hover:text-green-300 block">
                      {report.date}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate block max-w-[200px]">
                      ID: {report.id}
                    </span>
                  </div>
                  <span className="text-xs bg-white dark:bg-gray-600 border dark:border-gray-500 px-2 py-1 rounded text-gray-500 dark:text-gray-300 group-hover:border-green-200 dark:group-hover:border-green-800">
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
        <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-green-50 dark:border-gray-700 animate-fade-in-up transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3">
              <img src={complaint.imageUrl} alt="Report" className="w-full h-48 object-cover rounded-lg shadow-md mb-4" />
              <h3 className="font-bold text-lg text-gray-800 dark:text-white">Report Details</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{complaint.description}</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">ID: {complaint._id}</p>
            </div>
            <div className="w-full md:w-2/3 flex flex-col justify-center">
              <ul className="steps steps-vertical lg:steps-horizontal w-full">
                <li className={`step ${getStepClass("Pending")}`}>Received</li>
                <li className={`step ${getStepClass("In Progress")}`}>In Progress</li>
                <li className={`step ${getStepClass("Resolved")}`}>Resolved</li>
              </ul>
              <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300 text-sm font-medium text-center">
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