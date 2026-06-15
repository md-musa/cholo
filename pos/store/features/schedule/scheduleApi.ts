import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { ISchedule } from "./schedule.interface";

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery: axiosBaseQuery(),
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    getScheduleByRoute: builder.query<ISchedule[], { routeId: string; day: string }>({
      query: ({ routeId, day }) => ({
        url: "/schedules/get-single-route-schedule",
        method: "GET",
        params: { routeId, day: day.toLowerCase() },
      }),
    }),
  }),
});

export const { useGetScheduleByRouteQuery } = scheduleApi;
