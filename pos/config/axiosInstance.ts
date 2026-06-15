import axios from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";

import { getAccessToken, removeAccessToken } from "@/utils/authUtil";

// const SERVER_URL =
//   process.env.NODE_ENV === "development"
//     ? Constants.expoConfig?.extra?.DVELOPMENT_SERVER_URL
//     : Constants.expoConfig?.extra?.PRODUCTION_SERVER_URL;

// console.log(SERVER_URL);

const SERVER_URL = "http://192.168.0.106:4000"

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
