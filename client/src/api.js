// client/src/api.js
import axios from 'axios';

// 1. Define the correct Backend URL
// We append "/api" here so we don't have to write it in every component
const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api" 
  : "https://cleanquest-api.onrender.com/api";

// 2. Create the Axios Instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // withCredentials is correctly removed as per your backend CORS setup
});