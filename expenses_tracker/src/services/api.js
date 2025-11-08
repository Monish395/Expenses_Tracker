// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000", // change if backend URL is different after deployment
//   headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT
//   },
// });

// export default API;

// src/services/API.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor – inject fresh token before every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – handle expired/invalid token
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Token invalid or expired
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login"; // force re-login
    }
    return Promise.reject(error);
  }
);

export default API;
