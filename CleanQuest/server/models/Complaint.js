// server/models/Complaint.js
const mongoose = require('mongoose');

// This is the "Blueprint" for every complaint
const ComplaintSchema = new mongoose.Schema({
  citizenName: String,
  description: String,
  email: String,
  location: {
    lat: Number, // Latitude
    lng: Number  // Longitude
  },
  imageUrl: String, // We will save the link to the photo here
  status: {
    type: String,
    default: "Pending" // Automatically starts as Pending
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);