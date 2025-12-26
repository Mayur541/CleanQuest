// client/src/api.js
import axios from 'axios';

// Automatically switches: Localhost for you, Render for the internet
const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000" 
  : "https://cleanquest-api.onrender.com";
  
export const api = axios.create({
  baseURL: API_URL,
});