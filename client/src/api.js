// client/src/api.js
import axios from 'axios';

// 1. Define the correct Backend URL
// REMOVE "/api" from here, because your components are already adding it.
const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "https://cleanquest-api.onrender.com";

// 2. Create the Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials is intentionally removed
});