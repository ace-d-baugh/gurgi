import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
 baseURL: API_URL,
 headers: {
 'Content-Type': 'application/json',
 },
});

// Add auth token only if it exists (for authenticated routes)
api.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 // Only add Authorization header if we have a token
 // This allows public routes (rides, game, locations) to work without auth
 if (token && token !== 'null' && token !== 'undefined') {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

export default api;
