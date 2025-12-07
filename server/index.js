// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Complaint = require('./models/Complaint'); // Import your model
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB (Replace with your actual Atlas String later)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cleanquest')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// --- API ROUTES ---

// ROUTE 1: Create a Complaint (Frontend sends data here)
app.post('/api/complaints', async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to save complaint" });
  }
});

// ROUTE 2: Get All Complaints (For the Admin Dashboard)
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// ROUTE 3: Update Status (For Admin to mark as "Resolved")
app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});