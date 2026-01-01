// server/index.js
require('dotenv').config(); // Always put this at the very top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Import Models
const Complaint = require('./models/Complaint');
const Admin = require('./models/Admin');

const app = express();

app.use(cors({
  origin: "*", // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization", // Allow these headers
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Enable Pre-Flight for ALL routes (Crucial for the "Missing Header" error)
app.options('*', cors());

// --- 2. INCREASE PAYLOAD LIMIT (For Mobile Photos) ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 3. CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cleanquest')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));


// --- API ROUTES ---

// Create Complaint
app.post('/api/complaints', async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Save Error:", error); // Log error to see details in Render Dashboard
    res.status(500).json({ error: "Failed to save complaint" });
  }
});

// Get All (Admin)
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

// Update Status (Admin)
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

// Get Single (Tracker)
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaint" });
  }
});

// Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Complaint.aggregate([
      {
        $group: {
          _id: "$citizenName",
          totalReports: { $sum: 1 },
          resolvedReports: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } }
        }
      },
      {
        $addFields: {
          score: { $add: [{ $multiply: ["$totalReports", 10] }, { $multiply: ["$resolvedReports", 50] }] }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});


// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, secretKey } = req.body;
    if (secretKey !== "cleanquest_secure_2025") {
      return res.status(403).json({ error: "❌ Invalid Secret Key" });
    }
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ error: "Username taken" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered" });
  } catch (error) {
    res.status(500).json({ error: "Error registering admin" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    res.json({ message: "Login Successful", username: admin.username });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- 4. SERVER LISTENING (Crucial Fix) ---
// Must use process.env.PORT for Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});