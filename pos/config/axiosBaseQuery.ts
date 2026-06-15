import { AxiosError, AxiosRequestConfig } from "axios";

import axiosInstance from "./axiosInstance";

interface BaseQueryArgs {
  url: string;
  method: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
}

export const axiosBaseQuery =
  () =>
    async ({ url, method, data, params }: BaseQueryArgs) => {
      try {
        const result = await axiosInstance({ url, method, data, params });
        return { data: result };
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
