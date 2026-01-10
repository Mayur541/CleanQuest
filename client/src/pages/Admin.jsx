import { useEffect, useState } from 'react';
import { api } from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/api/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/api/complaints/${id}`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const defaultCenter = [19.0760, 72.8777]; 

  return (
    // DARK MODE: Main Background
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & CONTROLS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Municipal Dashboard</h2>
          
          <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                viewMode === "grid" 
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              📋 Grid View
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                viewMode === "map" 
                ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              🗺️ Map View
            </button>
            <button 
              onClick={fetchComplaints} 
              className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md border-l border-gray-100 dark:border-gray-600 ml-1"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {/* --- VIEW 1: THE GRID --- */}
        {viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((c) => (
              <div key={c._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col transition hover:shadow-lg">
                <div className="h-56 overflow-hidden bg-gray-200 dark:bg-gray-700 relative group">
                  <img 
                    src={c.imageUrl || "https://via.placeholder.com/300"} 
                    alt="Waste" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${
                      c.status === 'Resolved' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800' : 
                      c.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1">{c.description}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reported by: {c.citizenName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">
                      📍 {c.location?.lat ? `${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}` : "No Location"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2">
                    <div className="flex gap-2">
                      {c.status === "Pending" && <button onClick={() => updateStatus(c._id, "In Progress")} className="flex-1 bg-yellow-500 text-white text-sm font-medium px-3 py-2 rounded hover:bg-yellow-600">Start Work 🚧</button>}
                      {c.status === "In Progress" && <button onClick={() => updateStatus(c._id, "Resolved")} className="flex-1 bg-green-600 text-white text-sm font-medium px-3 py-2 rounded hover:bg-green-700">Mark Done ✅</button>}
                      {c.status === "Resolved" && <span className="text-green-600 dark:text-green-400 text-sm font-bold w-full text-center bg-green-50 dark:bg-green-900/20 py-2 rounded">Case Closed 👏</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW 2: THE MAP --- */}
        {viewMode === "map" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-xl border-4 border-white dark:border-gray-700">
            <MapContainer 
              center={complaints[0]?.location ? [complaints[0].location.lat, complaints[0].location.lng] : defaultCenter} 
              zoom={13} 
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {complaints.map((c) => (
                c.location && (
                  <Marker 
                    key={c._id} 
                    position={[c.location.lat, c.location.lng]}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 w-48">
                        <img src={c.imageUrl} className="w-full h-24 object-cover rounded mb-2" alt="evidence"/>
                        <p className="font-bold text-sm text-black">{c.description}</p>
                        <p className="text-xs text-gray-500 mb-2">{c.status}</p>
                        {c.status !== "Resolved" && (
                          <button 
                            onClick={() => updateStatus(c._id, "Resolved")}
                            className="bg-green-600 text-white text-xs px-2 py-1 rounded w-full"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        )}

        {/* Empty State */}
        {complaints.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
            <p className="text-xl">No complaints found. Good job! 🌍</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;