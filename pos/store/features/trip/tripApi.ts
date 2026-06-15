import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { BUS_TYPES } from "@/constants";

export interface CreateTripPayload {
  routeId: string;
  hostId: string;
  busName: string;
  busType: BUS_TYPES;
}

export const tripApi = createApi({
  reducerPath: "tripApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createTrip: builder.mutation<any, CreateTripPayload>({
      query: (tripData) => ({
        url: "/trips",
        method: "POST",
        data: tripData,
      }),
    }),
  }),
});

export const { useCreateTripMutation } = tripApi;
