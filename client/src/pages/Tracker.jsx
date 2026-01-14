import { useState, useEffect } from 'react';
import { api } from '../api';

function Tracker() {
  const [trackId, setTrackId] = useState('');
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. LOAD RECENT REPORTS FROM LOCALSTORAGE ---
  useEffect(() => {
    // Ensuring we pull the array correctly
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
      setError("⚠️ Please enter a valid ID");
      return;
    }

    setLoading(true);

    try {
      // Fetching from your backend API
      const res = await api.get(`/api/complaints/${idToSearch}`);
      // Adding a small delay for better UX feel
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
    
    // DaisyUI step-primary logic
    if (currentIdx >= stepIdx) return "step-primary"; 
    return "";
  };

  const getDeadlineText = (dateString) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-500 font-bold">⚠️ Overdue by {Math.abs(diffDays)} days</span>;
    if (diffDays === 0) return <span className="text-orange-500 font-bold">🚨 Due Today!</span>;
    return <span className="text-green-500 font-bold">{diffDays} days remaining</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">Live Status Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your waste reports and help keep the city clean.</p>
        </div>

        {/* --- SEARCH BOX & HISTORY --- */}
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 mb-10">
          <form onSubmit={handleTrack} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Paste Tracking ID here..." 
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 outline-none transition"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              disabled={loading} 
            />
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <span className="loading loading-spinner loading-sm"></span> : "Track"}
            </button>
          </form>
          
          {error && <p className="text-red-500 mt-4 text-sm font-semibold animate-pulse">{error}</p>}

          {/* RECENT REPORTS HISTORY */}
          {recentReports.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Recent Reports</h3>
              <div className="space-y-3">
                {recentReports.slice(0, 5).map((report) => (
                  <button 
                    key={report.id}
                    onClick={(e) => handleTrack(e, report.id)}
                    className="w-full flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition group"
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-400 transition">{report.date}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate w-40">ID: {report.id}</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-500">Track →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- RESULT CARD --- */}
        {complaint && (
          <div className="w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col md:flex-row gap-10">
              
              {/* Left Side: Image & ID */}
              <div className="md:w-1/3">
                <div className="relative group">
                  <img 
                    src={complaint.imageUrl} 
                    alt="Report" 
                    className="w-full h-52 object-cover rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700" 
                  />
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-white shadow-lg ${
                    complaint.priority === 'High' ? 'bg-red-600' : 
                    complaint.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-600'
                  }`}>
                    {complaint.priority} Priority
                  </div>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{complaint.category}</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{complaint.description}</p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-400 font-mono break-all uppercase tracking-widest">Tracking ID: {complaint._id}</p>
                    <div className="mt-3 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl">
                      <p className="text-[11px] text-gray-400 uppercase font-bold mb-1">Estimated Resolution</p>
                      {getDeadlineText(complaint.deadline)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Timeline & Status */}
              <div className="md:w-2/3 flex flex-col justify-center border-l border-gray-50 dark:border-gray-700 md:pl-10">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10 text-center md:text-left">Work Progress</h3>
                
                {/* DaisyUI Steps */}
                <ul className="steps steps-vertical lg:steps-horizontal w-full text-gray-600 dark:text-gray-300 font-bold text-sm">
                  <li className={`step ${getStepClass("Pending")}`}>Received</li>
                  <li className={`step ${getStepClass("In Progress")}`}>Dispatch</li>
                  <li className={`step ${getStepClass("Resolved")}`}>Cleaned</li>
                </ul>

                <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-600 dark:text-green-500 font-black uppercase tracking-wider mb-1">Current Phase</p>
                    <h4 className="text-2xl font-black text-green-800 dark:text-green-400 uppercase">{complaint.status}</h4>
                  </div>
                  <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/50">
                    {complaint.status === 'Resolved' ? '✓' : '●'}
                  </div>
                </div>

                {complaint.status === 'Resolved' && (
                  <div className="mt-6 text-center animate-bounce">
                    <p className="text-green-600 dark:text-green-400 font-black text-sm">🎉 Area has been cleared!</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tracker;