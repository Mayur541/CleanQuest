import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get User Data from Storage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate('/login/user'); // Kick them out if not logged in
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 2. Fetch User's History (Hackathon Logic: Fetch all and filter by username)
    // In a real app, you would hit an endpoint like /api/complaints/user/:id
    const fetchHistory = async () => {
      try {
        const res = await api.get('/api/complaints');
        // Filter complaints where citizenName matches username
        const userComplaints = res.data.filter(
          item => item.citizenName?.toLowerCase() === parsedUser.username?.toLowerCase()
        );
        setMyReports(userComplaints);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-3xl shadow-inner">
              👤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Hello, <span className="text-green-600 dark:text-green-400">{user.username}</span>!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Citizen • {user.role || 'User'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium text-sm transition"
          >
            Logout
          </button>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Total Reports</p>
            <p className="text-4xl font-extrabold text-gray-800 dark:text-white mt-2">{myReports.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase">Impact Score</p>
            <p className="text-4xl font-extrabold text-green-600 dark:text-green-400 mt-2">{myReports.length * 10}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-md text-white flex flex-col justify-between">
            <p className="font-bold opacity-90">Have a new issue?</p>
            <Link to="/" className="inline-block mt-4 bg-white text-green-600 text-center font-bold py-2 rounded-lg hover:bg-gray-50 transition">
              Report Now 📸
            </Link>
          </div>
        </div>

        {/* --- REPORT HISTORY --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Report History</h2>
          </div>
          
          {loading ? (
             <div className="p-8 text-center text-gray-500">Loading history...</div>
          ) : myReports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🍃</div>
              <p className="text-gray-500 dark:text-gray-400">You haven't submitted any reports yet.</p>
              <Link to="/" className="text-green-600 font-bold hover:underline mt-2 inline-block">Start cleaning up!</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {myReports.map((report) => (
                <div key={report._id} className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={report.imageUrl} 
                      alt="Evidence" 
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                    />
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-sm md:text-base line-clamp-1">{report.description}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {report._id.slice(-6).toUpperCase()}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        report.status === 'Resolved' ? 'bg-green-100 text-green-700' : 
                        report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {report.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden md:block">
                     <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;