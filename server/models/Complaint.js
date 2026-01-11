const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  citizenName: String,
  description: String,
  location: { lat: Number, lng: Number },
  imageUrl: String, // The "Before" Photo
  
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: "Pending"
  },

  // --- AI FIELDS ---
  category: { type: String, default: "Uncategorized" },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Low' },
  deadline: { type: Date },

  // --- NEW: PROOF OF RESOLUTION ---
  resolvedImageUrl: { type: String }, // The "After" Photo
  resolvedAt: { type: Date },         // When was it cleaned?

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);