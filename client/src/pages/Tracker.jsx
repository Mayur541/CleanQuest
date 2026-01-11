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
      await new Promise(resolve => setTimeout(resolve, 500)); // smooth loading
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

  // --- HELPER: DEADLINE FORMATTER ---
  const getDeadlineText = (dateString) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-600 font-bold">⚠️ Overdue by {Math.abs(diffDays)} days</span>;
    if (diffDays === 0) return <span className="text-red-600 font-bold">🚨 Due Today!</span>;
    return <span className="text-green-600 font-bold">{diffDays} days remaining</span>;
  };

  return (
    // ✅ ALIGNMENT FIX: Added 'flex flex-col items-center' to center everything
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-12 px-4 transition-colors duration-300">
      
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
        <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-green-50 dark:border-gray-700 animate-fade-in-up transition-colors duration-300">
          <div className="flex flex-col gap-8">
            
            {/* --- TOP SECTION: TIMELINE --- */}
            <div className="w-full flex flex-col justify-center">
              <ul className="steps steps-vertical lg:steps-horizontal w-full">
                <li className={`step ${getStepClass("Pending")}`}>Received</li>
                <li className={`step ${getStepClass("In Progress")}`}>In Progress</li>
                <li className={`step ${getStepClass("Resolved")}`}>Resolved</li>
              </ul>
            </div>

            {/* --- MIDDLE SECTION: CONTENT OR COMPARISON --- */}
            
            {/* If Resolved & Has Proof -> Show Comparison */}
            {complaint.status === "Resolved" && complaint.resolvedImageUrl ? (
               <div className="grid md:grid-cols-2 gap-8 mt-4">
                 
                 {/* BEFORE */}
                 <div className="flex flex-col items-center">
                   <div className="relative w-full h-64">
                      <img src={complaint.imageUrl} alt="Before" className="w-full h-full object-cover rounded-lg shadow-md border-4 border-red-100" />
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">BEFORE</span>
                   </div>
                   <div className="mt-3 text-left w-full">
                     <h3 className="font-bold text-gray-800 dark:text-white">{complaint.category || "Issue"}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">{complaint.description}</p>
                   </div>
                 </div>

                 {/* AFTER */}
                 <div className="flex flex-col items-center">
                    <div className="relative w-full h-64">
                      <img src={complaint.resolvedImageUrl} alt="After" className="w-full h-full object-cover rounded-lg shadow-xl border-4 border-green-100 scale-105" />
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">AFTER (Cleaned)</span>
                    </div>
                    <div className="mt-3 text-center w-full">
                      <p className="text-green-600 font-bold flex items-center justify-center gap-1">
                        ✅ Verified Resolution
                      </p>
                      <p className="text-xs text-gray-400">
                        Resolved on: {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                 </div>

               </div>
            ) : (
              // If NOT resolved (or no proof), show standard layout
              <div className="flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-full md:w-1/3 relative">
                    <img src={complaint.imageUrl} alt="Report" className="w-full h-48 object-cover rounded-lg shadow-md mb-4" />
                    <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase rounded shadow text-white ${
                      complaint.priority === 'High' ? 'bg-red-600' : 
                      complaint.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-600'
                    }`}>
                      {complaint.priority || 'Low'} Priority
                    </span>
                 </div>
                 <div className="w-full md:w-2/3">
                    <h3 className="font-bold text-2xl text-gray-800 dark:text-white">{complaint.category || "Uncategorized"}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-base mt-2">{complaint.description}</p>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Complaint ID</p>
                        <p className="text-sm font-mono dark:text-gray-300">{complaint._id}</p>
                      </div>
                      <div>
                         <p className="text-xs text-gray-400 uppercase font-bold">Estimated Resolution</p>
                         <div className="text-sm">{getDeadlineText(complaint.deadline)}</div>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {/* --- BOTTOM SECTION: STATUS BANNER --- */}
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
              <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                Current Status: <span className="font-bold uppercase text-lg block mt-1">{complaint.status}</span>
              </p>
            </div>

            {complaint.status === 'Resolved' && (
              <div className="text-center animate-bounce mt-2">
                <span className="text-4xl">🎉</span>
                <p className="text-green-600 font-bold mt-2">Thank you for helping keep our city clean!</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

export default Tracker;