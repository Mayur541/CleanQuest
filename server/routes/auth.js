// FILE: server/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- SIGNUP (Register) ---
router.post('/signup', async (req, res) => {
  const { username, password, role, secretKey } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already taken" });

    if (role === 'admin' && secretKey !== 'admin123') {
      return res.status(403).json({ error: "Invalid Admin Secret Key!" });
    }

    const newUser = new User({ username, password, role: role || 'user' });
    await newUser.save();
    
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.password !== password) return res.status(400).json({ error: "Invalid password" });

    if (role && user.role !== role) {
      return res.status(403).json({ error: `Access Denied: You are not an ${role}` });
    }

    res.json({
      message: "Login successful",
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
//
