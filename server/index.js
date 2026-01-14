require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { GoogleGenAI } = require("@google/genai"); 

// Import Models
const User = require('./models/User'); 
const Complaint = require('./models/Complaint');
const authRoutes = require('./routes/auth'); 

const app = express();

// --- INITIALIZE AI CLIENT ---
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ CRITICAL ERROR: GEMINI_API_KEY is missing!");
} else {
  console.log("✅ Gemini API Key found.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors({
  origin: "*", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter); 

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cleanquest')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));


// --- AI HELPER FUNCTION: THE "WATERFALL" STRATEGY ---
async function runAIAnalysis(base64Data, userCategory) {
  // 1. Try the absolute latest (3.0)
  // 2. Fallback to the current standard (2.0)
  // 3. Safety net (1.5 Flash) - extremely high quota
  const modelsToTry = ["gemini-3.0-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting analysis with ${modelName}...`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: "user",
            parts: [
              { text: `Analyze this image of civic waste. 
                       Classify into: 'Bio-Hazard', 'Dead Animal', 'Garbage Dump', 'Construction Debris', 'Litter'.
                       Return ONLY valid JSON: { "category": "...", "severity": "...", "hours": 0 }
                       Rules:
                       - Bio-Hazard/Dead Animal -> High Severity, 24 hours.
                       - Garbage Dump/Construction -> Medium Severity, 72 hours.
                       - Litter -> Low Severity, 168 hours.` },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ]
      });

      // Parse response using the SDK's text helper
      const text = response.text().replace(/```json|```/g, "").trim();
      const data = JSON.parse(text);
      
      console.log(`✅ Success! Used model: ${modelName}`);
      return data;

    } catch (err) {
      // Log the specific error for debugging
      console.warn(`⚠️ ${modelName} Failed: ${err.message.split(' ').slice(0, 10).join(' ')}...`);
      
      // If 3.0 isn't available yet or quota is full, the loop continues to 2.0 automatically.
      continue; 
    }
  }
  return null; // All 3 models failed
}


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
      if (nearby) return res.status(400).json({ error: "⚠️ Already reported here!" });
    }

    // --- B. AI ANALYSIS LOGIC ---
    let aiSeverity = "Low";
    let aiDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    let aiCategory = userCategory || "Litter";

    if (imageUrl && process.env.GEMINI_API_KEY) {
      const base64Data = imageUrl.includes(",") ? imageUrl.split(",")[1] : imageUrl;
      
      try {
        const aiResult = await runAIAnalysis(base64Data, userCategory);
        
        if (aiResult) {
          aiSeverity = aiResult.severity || "Low";
          aiCategory = aiResult.category || aiCategory;
          aiDeadline = new Date(Date.now() + (aiResult.hours || 168) * 60 * 60 * 1000);
          console.log("✅ Final AI Data:", aiResult);
        } else {
          console.error("❌ All AI models failed. Saving with default category.");
        }
      } catch (aiError) {
        console.error("❌ Critical AI Logic Error:", aiError.message);
      }
    } 

    // --- C. SAVE TO DB ---
    const newComplaint = new Complaint({
      citizenName: citizenName || "Anonymous",
      description,
      location,
      imageUrl,
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

// --- REMAINING ROUTES ---
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.aggregate([
      { $addFields: { sortOrder: { $switch: { 
        branches: [
          { case: { $eq: ["$priority", "High"] }, then: 1 },
          { case: { $eq: ["$priority", "Medium"] }, then: 2 },
          { case: { $eq: ["$priority", "Low"] }, then: 3 }
        ], default: 4 
      } } } },
      { $sort: { sortOrder: 1, createdAt: -1 } } 
    ]);
    res.json(complaints);
  } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.put('/api/complaints/:id', async (req, res) => {
  try {
    const { status, resolvedImageUrl } = req.body;
    const updateData = { status };
    if (status === "Resolved" && resolvedImageUrl) {
      updateData.resolvedImageUrl = resolvedImageUrl;
      updateData.resolvedAt = new Date();
    }
    const updated = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

app.get('/api/stats', async (req, res) => {
  try {
    const totalReports = await Complaint.countDocuments();
    const resolvedReports = await Complaint.countDocuments({ status: "Resolved" });
    const totalUsers = await User.countDocuments({ role: "user" }); 
    res.json({ totalReports, resolvedReports, totalUsers });
  } catch (err) { res.status(500).json({ error: "Stats failed" }); }
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));