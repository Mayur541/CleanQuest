import axios from 'axios';

// 🟢 PROXY SETUP
// We leave the baseURL empty. 
// This means axios will request "https://www.cleanquest.me/api/..."
// Vercel will see this and forward it to Render automatically.
const API_URL = ""; 

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});