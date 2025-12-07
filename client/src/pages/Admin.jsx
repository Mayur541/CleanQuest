// client/src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

function Admin() {
  const [complaints, setComplaints] = useState([]);

  // Fetch data when page loads
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const res = await axios.get('http://localhost:5000/api/complaints');
    setComplaints(res.data);
  };

  const markResolved = async (id) => {
    await axios.put(`http://localhost:5000/api/complaints/${id}`, { status: "Resolved" });
    fetchComplaints(); // Refresh the list
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Municipal Dashboard</h2>
      
      <div className="grid gap-4">
        {complaints.map((c) => (
          <div key={c._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-bold text-lg">{c.description}</p>
              <p className="text-gray-500">Reported by: {c.citizenName}</p>
              <p className="text-sm">Loc: {c.location?.lat}, {c.location?.lng}</p>
              <span className={`px-2 py-1 text-sm rounded ${c.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {c.status}
              </span>
            </div>
            
            {c.status === "Pending" && (
              <button 
                onClick={() => markResolved(c._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Mark Done
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;