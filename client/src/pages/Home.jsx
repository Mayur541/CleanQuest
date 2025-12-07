// client/src/pages/Home.jsx
import { useState } from 'react';
import axios from 'axios';

function Home() {
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [location, setLocation] = useState(null);
  
  // Function to get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        alert("Location Fetched!");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Function to submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create the data object to send
    const complaintData = {
      citizenName,
      description,
      location,
      imageUrl: "https://via.placeholder.com/150" // Placeholder for now!
    };

    try {
      // Send to Backend
      await axios.post('http://localhost:5000/api/complaints', complaintData);
      alert('Complaint Submitted Successfully!');
    } catch (error) {
      console.error(error);
      alert('Error submitting complaint');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Report Waste</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <input 
          type="text" 
          placeholder="Your Name" 
          className="w-full p-2 border rounded"
          value={citizenName}
          onChange={(e) => setCitizenName(e.target.value)}
        />

        <textarea 
          placeholder="Describe the waste..." 
          className="w-full p-2 border rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button 
          type="button" 
          onClick={getLocation}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {location ? "Location Saved ✅" : "📍 Get My Location"}
        </button>

        <button 
          type="submit" 
          className="bg-green-600 text-white px-4 py-2 rounded w-full font-bold"
        >
          Submit Complaint
        </button>
      </form>
    </div>
  );
}

export default Home;