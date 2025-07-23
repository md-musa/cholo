import axios from "axios";

const SERVER_URL = "http://localhost:4000/api/v1";

const apiClient = axios.create({
  baseURL: SERVER_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = "your_auth_token";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("🟥🟥 sAPI Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
