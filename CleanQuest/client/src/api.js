// client/src/api.js
import axios from 'axios';

// 1. Define the correct Backend URL
// We use the URL that you just proved is working:
const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "https://cleanquest.onrender.com"; // <--- Updated to the correct URL

// 2. Create the Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});