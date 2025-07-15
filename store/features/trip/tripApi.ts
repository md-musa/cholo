// features/trip/tripApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/config/axiosBaseQuery";

export const tripApi = createApi({
  reducerPath: "tripApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Trip"],
  endpoints: (builder) => ({
    createTrip: builder.mutation({
      query: (tripData) => ({
        url: "/trips",
        method: "POST",
        data: tripData,
      }),
      invalidatesTags: ["Trip"],
    }),
    getTrips: builder.query({
      query: () => ({
        url: "/trips",
        method: "GET",
      }),
      providesTags: ["Trip"],
    }),
  }),
});

export const { useCreateTripMutation, useGetTripsQuery } = tripApi;
