import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// attach token automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  // get stored token
  if (token) config.headers['x-auth-token'] = token; // attach exactly
  return config;
});

export default API;
