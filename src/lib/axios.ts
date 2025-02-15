import axios from "axios";

// Create a custom instance of axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // For public endpoints, just return the config without auth header
  if (config.url?.includes("/public/")) {
    return config;
  }

  // For protected endpoints, add the auth header if token exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always return the config
  return config;
});

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
    }
    return Promise.reject(error);
  }
);

export default api;
