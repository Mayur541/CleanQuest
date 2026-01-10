// server/models/Admin.js
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true } // This will be the "Hashed" password
});

module.exports = mongoose.model('Admin', AdminSchema);