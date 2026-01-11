const mongoose = require('mongoose');

// This is the "Blueprint" for every complaint
const ComplaintSchema = new mongoose.Schema({
  email: String,
  citizenName: String,
  description: String,
  
  location: {
    lat: Number, // Latitude
    lng: Number  // Longitude
  },
  
  imageUrl: String, // Base64 string or URL of the image
  
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: "Pending"
  },

  // --- NEW AI FIELDS ---
  category: { 
    type: String, 
    default: "Uncategorized" // The AI will categorize this (e.g., "Medical Waste")
  },
  
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'],
    default: 'Low' // The AI will calculate this based on severity
  },
  
  deadline: { 
    type: Date // The AI will set this deadline (e.g., +24 hours for High priority)
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);