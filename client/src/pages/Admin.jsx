import { useEffect, useState, useRef } from 'react';
import { api } from '../api';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- LEAFLET ICON FIX ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function Admin() {
  const [complaints, setComplaints] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [loading, setLoading] = useState(true);
  
  // --- NEW: File Upload Refs ---
  const fileInputRef = useRef(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/api/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle File Selection ---
  const handleResolveClick = (id) => {
    setSelectedComplaintId(id);
    if(fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedComplaintId) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      
      try {
        await api.put(`/api/complaints/${selectedComplaintId}`, { 
          status: "Resolved",
          resolvedImageUrl: base64Image 
        });
        alert("✅ Proof Uploaded! Complaint Resolved.");
        fetchComplaints(); // Refresh Data
      } catch (err) {
        alert("❌ Failed to upload proof.");
        console.error(err);
      }
    };
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/complaints/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // --- HELPERS ---
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-4 border-red-600 bg-red-50 dark:bg-red-900/10';
      case 'Medium': return 'border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      default: return 'border-l-4 border-green-500 bg-white dark:bg-gray-800';
    }
  };

  const getMapColor = (priority) => {
    switch (priority) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      default: return 'green';
    }
  };

  const getDeadlineText = (dateString) => {
    if (!dateString) return <span className="text-gray-400 text-xs">No Deadline</span>;
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="text-red-700 font-bold animate-pulse">⚠️ OVERDUE ({Math.abs(diffDays)} days)</span>;
    if (diffDays === 0) return <span className="text-red-600 font-bold">🚨 DUE TODAY</span>;
    return <span className="text-gray-600 dark:text-gray-400 font-medium">{diffDays} days left</span>;
  };

  const defaultCenter = [19.0760, 72.8777]; 

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      
      {/* --- HIDDEN INPUT FOR FILE UPLOAD --- */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Municipal Dashboard 🛡️</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage city issues sorted by AI Priority</p>
          </div>
          
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button onClick={() => setViewMode("grid")} className={`px-4 py-2 rounded-md font-medium transition ${viewMode === "grid" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>📋 Grid View</button>
            <button onClick={() => setViewMode("map")} className={`px-4 py-2 rounded-md font-medium transition ${viewMode === "map" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>🗺️ Map View</button>
            <button onClick={fetchComplaints} className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md border-l border-gray-100 dark:border-gray-600 ml-1">🔄 Refresh</button>
          </div>
        </div>
        
        {viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((c) => (
              <div key={c._id} className={`rounded-xl shadow-md overflow-hidden flex flex-col transition hover:shadow-lg dark:border-gray-700 ${getPriorityStyle(c.priority)}`}>
                <div className="h-56 overflow-hidden bg-gray-200 dark:bg-gray-700 relative group">
                  {/* Show Resolved Image if available, else original */}
                  <img 
                    src={c.status === "Resolved" && c.resolvedImageUrl ? c.resolvedImageUrl : (c.imageUrl || "https://via.placeholder.com/300")} 
                    alt="Waste" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm bg-white/90 backdrop-blur-sm ${c.status === 'Resolved' ? 'text-green-700' : c.status === 'In Progress' ? 'text-blue-700' : 'text-yellow-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded shadow-sm text-white ${c.priority === 'High' ? 'bg-red-600' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-600'}`}>
                      {c.priority} Priority
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1 bg-white dark:bg-gray-800">
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1">{c.category || "Uncategorized"}</h3>
                      <div className="text-right text-xs">{getDeadlineText(c.deadline)}</div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">{c.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-mono">
                      <span>👤 {c.citizenName}</span>
                      <span>📍 {c.location?.lat ? `${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}` : "No Loc"}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                    <div className="flex gap-2">
                      {c.status === "Pending" && <button onClick={() => updateStatus(c._id, "In Progress")} className="flex-1 bg-yellow-500 text-white text-sm font-medium px-3 py-2 rounded hover:bg-yellow-600 shadow-sm">Start Work 🚧</button>}
                      
                      {/* --- TRIGGER UPLOAD ON CLICK --- */}
                      {c.status === "In Progress" && <button onClick={() => handleResolveClick(c._id)} className="flex-1 bg-green-600 text-white text-sm font-medium px-3 py-2 rounded hover:bg-green-700 shadow-sm">Upload Proof & Resolve ✅</button>}
                      
                      {c.status === "Resolved" && <span className="text-green-600 dark:text-green-400 text-sm font-bold w-full text-center bg-green-50 dark:bg-green-900/20 py-2 rounded">Case Closed 👏</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === "map" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700 relative">
            <div className="absolute top-4 right-4 z-[400] bg-white dark:bg-gray-800 p-2 rounded shadow-lg text-xs font-bold flex flex-col gap-1">
              <span className="text-red-600 flex items-center gap-1">● High Priority</span>
              <span className="text-orange-500 flex items-center gap-1">● Medium Priority</span>
              <span className="text-green-600 flex items-center gap-1">● Low Priority</span>
            </div>
            <MapContainer center={complaints[0]?.location ? [complaints[0].location.lat, complaints[0].location.lng] : defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
              {complaints.map((c) => c.location && (
                  <CircleMarker key={c._id} center={[c.location.lat, c.location.lng]} pathOptions={{ color: getMapColor(c.priority), fillColor: getMapColor(c.priority), fillOpacity: 0.7 }} radius={10}>
                    <Popup className="custom-popup">
                      <div className="p-2 w-48 text-center">
                        <img src={c.imageUrl} className="w-full h-24 object-cover rounded mb-2 mx-auto" alt="evidence"/>
                        <strong className="block text-sm text-black">{c.category}</strong>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white my-1 inline-block ${c.priority === 'High' ? 'bg-red-500' : c.priority === 'Medium' ? 'bg-orange-500' : 'bg-green-500'}`}>{c.priority} Priority</span>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{c.description}</p>
                        {c.status !== "Resolved" ? (
                          <button onClick={() => handleResolveClick(c._id)} className="bg-green-600 text-white text-xs px-2 py-1 rounded w-full hover:bg-green-700">Upload Proof ✅</button>
                        ) : (<span className="text-green-600 text-xs font-bold">Resolved ✅</span>)}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;