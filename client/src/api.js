// client/src/api.js
import axios from 'axios';

// 1. Define the correct Backend URL
// Use the Render URL for production, or localhost for development
const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "https://cleanquest-api.onrender.com";

// 2. Create the Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // ⚠️ CRITICAL: Do NOT set withCredentials: true
  // We disabled it on the backend to allow the "*" wildcard. 
  // If you enable it here, it will crash.
});