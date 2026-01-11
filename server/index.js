require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 1. Import Routes
const authRoutes = require('./routes/auth'); // <--- usage of the separate file
const Complaint = require('./models/Complaint');

const app = express();

app.use(cors({
  origin: "*", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization", 
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.options(/.*/, cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter); 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cleanquest')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));


// --- COMPLAINT ROUTES ---

app.post('/api/complaints', async (req, res) => {
  try {
    const { location } = req.body;
    if (location) {
      const nearby = await Complaint.findOne({
        "location.lat": { $gt: location.lat - 0.0001, $lt: location.lat + 0.0001 },
        "location.lng": { $gt: location.lng - 0.0001, $lt: location.lng + 0.0001 },
        status: "Pending" 
      });
      if (nearby) {
        return res.status(400).json({ error: "⚠️ A report already exists at this exact location!" });
      }
    }
    const newComplaint = new Complaint(req.body);
    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Save Error:", error); 
    res.status(500).json({ error: "Failed to save complaint" });
  }
});

app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 }); 
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

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

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaint" });
  }
});

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


// --- AUTH ROUTES (THE FIX) ---
// We removed the manual code and ONLY use the router file now.
app.use('/api/auth', authRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});