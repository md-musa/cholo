import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { IBus } from "@/store/features/bus/busInterface";

export const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    getBuses: builder.query<IBus[], void>({
      query: () => ({ url: "/buses", method: "GET" }),
      transformResponse: (response: any) => response.data || response,
    }),
  }),
});

export const { useGetBusesQuery } = busApi;
