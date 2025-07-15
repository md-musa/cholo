// src/features/bus/busApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/config/axiosBaseQuery'; // your custom axios base query

export const busApi = createApi({
  reducerPath: 'busApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Bus'],
  endpoints: (builder) => ({
    getBuses: builder.query({
      query: () => ({ url: '/buses', method: 'GET' }),
      providesTags: ['Bus'],
    }),
    
    getBusById: builder.query({
      query: (id: string) => ({ url: `/buses/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'Bus', id }],
    }),
  }),
});

export const { useGetBusesQuery, useGetBusByIdQuery } = busApi;
