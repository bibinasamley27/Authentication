import axios from "axios";

// Create a configured Axios instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Crucial for reading/writing HttpOnly session cookies
});

// Request Interceptor: Automatically attach the JWT token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Intercept responses to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is unauthorized or session expired
    if (error.response && error.response.status === 401) {
      const errorData = error.response.data;
      
      // If the session has expired or token is invalid, clear credentials and redirect to login
      if (
        errorData.code === "AUTH_TOKEN_EXPIRED" ||
        errorData.code === "AUTH_TOKEN_INVALID" ||
        errorData.code === "AUTH_USER_NOT_FOUND"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Dispatch custom event to notify AuthContext to trigger state reset
        window.dispatchEvent(new Event("auth-session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
