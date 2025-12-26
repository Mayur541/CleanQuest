// server/index.js
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Complaint = require('./models/Complaint'); // Import your model
require('dotenv').config();

const app = express();
// server/index.js
app.use(cors({
  origin: ["http://localhost:5173", "https://cleanquest.vercel.app", "https://www.cleanquest.me"]
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// ROUTE 4: Get Single Complaint (For the Tracker) - ADD THIS
app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaint" });
  }
});

// ROUTE 5: Get Leaderboard Stats (Gamification)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Complaint.aggregate([
      {
        $group: {
          _id: "$citizenName", // Group by Name
          totalReports: { $sum: 1 },
          resolvedReports: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          // Score Calculation: 10pts per report + 50pts per resolution
          score: { $add: [{ $multiply: ["$totalReports", 10] }, { $multiply: ["$resolvedReports", 50] }] }
        }
      },
      { $sort: { score: -1 } }, // Highest score first
      { $limit: 10 } // Get Top 10
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// --- AUTHENTICATION ROUTES ---

// AUTH 1: Register a New Admin (SECURED)
app.post('/api/auth/signup', async (req, res) => {
  try {
    // 1. Get the secretKey from the request
    const { username, password, secretKey } = req.body;
    
    // 2. CHECK THE KEY (This is the security gate)
    // In a real app, use process.env.ADMIN_SECRET
    if (secretKey !== "cleanquest_secure_2025") {
      return res.status(403).json({ error: "❌ Invalid Admin Secret Key! You are not authorized." });
    }

    // 3. Check if user already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // 4. Encrypt password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error registering admin" });
  }
});

// AUTH 2: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Find the user
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // 2. Compare the password with the saved hash
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // 3. Success!
    res.json({ message: "Login Successful", username: admin.username });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});