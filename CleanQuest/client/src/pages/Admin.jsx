// client/src/pages/Admin.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Don't forget this!
import L from 'leaflet';
import emailjs from '@emailjs/browser';


// --- LEAFLET ICON FIX ---
// (Needed because Vite/React sometimes "loses" the default marker images)
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
      // 1. Update Database
      await api.put(`/api/complaints/${id}`, { status: newStatus });
      
      // 2. Find the specific complaint to get the user's email
      const complaint = complaints.find(c => c._id === id);

      // 3. Send Email IF Resolved AND email exists
      if (newStatus === "Resolved" && complaint?.email) {
        
        const templateParams = {
          to_name: complaint.citizenName,
          to_email: complaint.email,
          description: complaint.description,
          // Add any other variables your template expects
        };

        emailjs.send(
          "service_biacd1g",   // <--- PASTE ID HERE
          "template_v09rozq",  // <--- PASTE ID HERE
          templateParams,
          "b4L9iJEMYdD0oYwPE"    // <--- PASTE KEY HERE
        )
        .then(() => {
           alert("Status updated & Email sent! 📧");
        })
        .catch((err) => {
           console.error("Email failed:", err);
           alert("Status updated, but Email failed to send.");
        });
      } else {
         // No email to send, just refresh
         fetchComplaints();
      }
      
      // 4. Refresh Grid/Map
      fetchComplaints();

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  // Default Center (Fallback if no complaints) - You can change to your city's coords
  // Example: New York [40.7128, -74.0060]
  const defaultCenter = [19.0760, 72.8777]; 

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & CONTROLS --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800">Municipal Dashboard</h2>
          
          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button 
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                viewMode === "grid" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              📋 Grid View
            </button>
            <button 
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                viewMode === "map" ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              🗺️ Map View
            </button>
            <button 
              onClick={fetchComplaints} 
              className="px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-md border-l border-gray-100 ml-1"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {/* --- VIEW 1: THE GRID (Existing Code) --- */}
        {viewMode === "grid" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((c) => (
              <div key={c._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col transition hover:shadow-lg">
                <div className="h-56 overflow-hidden bg-gray-200 relative group">
                  <img 
                    src={c.imageUrl || "https://via.placeholder.com/300"} 
                    alt="Waste" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2">
                     <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${
                      c.status === 'Resolved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                      c.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{c.description}</h3>
                    <p className="text-sm text-gray-500 mt-1">Reported by: {c.citizenName}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      📍 {c.location?.lat ? `${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}` : "No Location"}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <div className="flex gap-2">
                      {c.status === "Pending" && <button onClick={() => updateStatus(c._id, "In Progress")} className="flex-1 bg-yellow-500 text-white text-sm font-medium px-3 py-2 rounded">Start Work 🚧</button>}
                      {c.status === "In Progress" && <button onClick={() => updateStatus(c._id, "Resolved")} className="flex-1 bg-green-600 text-white text-sm font-medium px-3 py-2 rounded">Mark Done ✅</button>}
                      {c.status === "Resolved" && <span className="text-green-600 text-sm font-bold w-full text-center bg-green-50 py-2 rounded">Case Closed 👏</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- VIEW 2: THE MAP (New Feature) --- */}
        {viewMode === "map" && (
          <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-xl border-4 border-white">
            <MapContainer 
              center={complaints[0]?.location ? [complaints[0].location.lat, complaints[0].location.lng] : defaultCenter} 
              zoom={13} 
              style={{ height: "100%", width: "100%" }}
            >
              {/* Street Map Tiles */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* Render Pins for every complaint */}
              {complaints.map((c) => (
                c.location && (
                  <Marker 
                    key={c._id} 
                    position={[c.location.lat, c.location.lng]}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 w-48">
                        <img src={c.imageUrl} className="w-full h-24 object-cover rounded mb-2" alt="evidence"/>
                        <p className="font-bold text-sm">{c.description}</p>
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
          <div className="text-center text-gray-500 mt-20">
            <p className="text-xl">No complaints found. Good job! 🌍</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;