import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { IRoute } from "@/store/features/route/route.interface";

export const routeApi = createApi({
  reducerPath: "routeApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getRoutes: builder.query<IRoute[], void>({
      query: () => ({ url: "/routes", method: "GET" }),
    }),
  }),
});

export const { useGetRoutesQuery } = routeApi;
