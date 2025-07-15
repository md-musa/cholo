import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const routeApi = createApi({
  reducerPath: "routeApi",
  baseQuery: axiosBaseQuery(),
  refetchOnReconnect: true,

  endpoints: (builder) => ({
    getRoutes: builder.query({
      query: () => ({ url: "/routes", method: "GET" }),
    }),
  }),
});

export const { useGetRoutesQuery } = routeApi;
