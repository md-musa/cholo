import axios from "axios";
import { router } from "expo-router";

import { getAccessToken, removeAccessToken } from "@/utils/authUtil";
import { SERVER_URL } from "./serverUrl.config";


const apiClient = axios.create({
  baseURL: `${SERVER_URL}/api/v1`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error?.response?.status === 401) {
      await removeAccessToken();
      router.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
