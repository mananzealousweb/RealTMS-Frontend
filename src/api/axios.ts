import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_NODE_URL,
});

// Request Interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => {
    // Check if server sent a new access token
    const newAccessToken = response.headers["x-access-token"]?.trim();
    if (newAccessToken) {
      console.log("🔄 Access token refreshed automatically");
      localStorage.setItem("access_token", newAccessToken);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if server sent a new token in error response
      const newAccessToken = error.response.headers["x-access-token"]?.trim();

      if (newAccessToken) {
        console.log("🔄 Token refreshed, retrying request...");

        // Save new token
        localStorage.setItem("access_token", newAccessToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry the original request
        return api(originalRequest);
      } else {
        // No new token provided, session expired
        console.log("❌ Session expired, redirecting to login...");

        // Clear tokens
        localStorage.removeItem("access_token");

        // Redirect to login
        window.location.href = "/login";

        return Promise.reject(error);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;
