require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
// REMOVED: const { GoogleGenerativeAI } = require("@google/generative-ai"); 

// Import Models
const User = require('./models/User'); 
const Complaint = require('./models/Complaint');
const authRoutes = require('./routes/auth'); 

const app = express();

// --- DEBUG: CHECK API KEY ---
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing in .env file!");
} else {
  console.log("✅ Gemini API Key found.");
}

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

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter); 

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cleanquest')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));


// --- COMPLAINT ROUTES ---

app.post('/api/complaints', async (req, res) => {
  try {
    const { citizenName, description, location, imageUrl, category: userCategory } = req.body;

    console.log("📩 Processing new complaint...");

    // --- A. DUPLICATE CHECK ---
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

    // --- B. AI ANALYSIS LOGIC (DIRECT FETCH) ---
    let aiSeverity = "Low";
    let aiDeadline = new Date();
    aiDeadline.setDate(aiDeadline.getDate() + 7); 
    let aiCategory = userCategory || "Litter";

    if (imageUrl && process.env.GEMINI_API_KEY) {
      try {
        console.log("🤖 Sending image to Gemini via Direct API...");
        
        const base64Data = imageUrl.includes("base64,") ? imageUrl.split("base64,")[1] : imageUrl;

        // DIRECT API CALL PAYLOAD
        const apiPayload = {
          contents: [{
            parts: [
              {
                text: `Analyze this image of civic waste. 
                       Classify into: 'Bio-Hazard', 'Dead Animal', 'Garbage Dump', 'Construction Debris', 'Litter'.
                       Rules:
                       - Bio-Hazard/Dead Animal -> High Severity, 24 hours.
                       - Garbage Dump/Construction -> Medium Severity, 72 hours.
                       - Litter -> Low Severity, 168 hours.
                       Return ONLY JSON: { "category": "...", "severity": "...", "hours": 0 }`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }]
        };

        // CALL GOOGLE API DIRECTLY
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
          }
        );

        if (!response.ok) {
           const errText = await response.text();
           throw new Error(`Google API Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        
        // Extract Text
        const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "").trim();
        console.log("🤖 Raw AI Response:", text); 

        const aiData = JSON.parse(text);
        console.log("✅ AI Analysis Parsed:", aiData);

        if(aiData.severity) aiSeverity = aiData.severity;
        if(aiData.category) aiCategory = aiData.category;
        
        const today = new Date();
        aiDeadline = new Date(today.getTime() + (aiData.hours * 60 * 60 * 1000));

      } catch (aiError) {
        console.error("❌ AI Analysis Failed:", aiError.message);
      }
    } 

    // --- C. SAVE TO DB ---
    const newComplaint = new Complaint({
      citizenName, description, location, imageUrl,
      status: "Pending",
      category: aiCategory,
      priority: aiSeverity,
      deadline: aiDeadline
    });

    await newComplaint.save();
    console.log("💾 Complaint Saved to DB");
    res.status(201).json(newComplaint);

  } catch (error) {
    console.error("Save Error:", error); 
    res.status(500).json({ error: "Failed to save complaint" });
  }
});

// GET Routes
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.aggregate([
      {
        $addFields: {
          sortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "High"] }, then: 1 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "Low"] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      { $sort: { sortOrder: 1, createdAt: -1 } } 
    ]);
    res.json(complaints);
  } catch (error) { res.status(500).json({ error: "Fetch failed" }); }
});

app.put('/api/complaints/:id', async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: "Update failed" }); }
});

app.get('/api/complaints/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json(complaint);
  } catch (error) { res.status(500).json({ error: "Fetch failed" }); }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Complaint.aggregate([
      { $group: { _id: "$citizenName", totalReports: { $sum: 1 }, resolvedReports: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } } } },
      { $addFields: { score: { $add: [{ $multiply: ["$totalReports", 10] }, { $multiply: ["$resolvedReports", 50] }] } } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);
    res.json(leaderboard);
  } catch (error) { res.status(500).json({ error: "Fetch failed" }); }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalReports = await Complaint.countDocuments();
    const resolvedReports = await Complaint.countDocuments({ status: "Resolved" });
    const totalUsers = await User.countDocuments({ role: "user" }); 
    res.json({ totalReports, resolvedReports, totalUsers });
  } catch (error) { res.status(500).json({ error: "Fetch failed" }); }
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));