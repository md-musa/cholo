import axiosInstance from "./axiosInstance";
import { AxiosRequestConfig, AxiosError } from "axios";

interface BaseQueryArgs {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: any;
  params?: any;
}

export const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }: BaseQueryArgs) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (error) {
      const err = error as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
