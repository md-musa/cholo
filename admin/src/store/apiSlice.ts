import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react"
import type { AxiosRequestConfig, AxiosError } from "axios"
import axiosInstance from "@/config/axios.config"


const axiosBaseQuery = (): BaseQueryFn<
  {
    url: string
    method?: AxiosRequestConfig["method"]
    data?: AxiosRequestConfig["data"]
    params?: AxiosRequestConfig["params"]
    headers?: AxiosRequestConfig["headers"]
  },
  unknown,
  unknown
> =>
  async ({ url, method = "GET", data, params, headers }) => {
    try {
      const result = await axiosInstance({ url, method, data, params, headers })
      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      }
    }
  }


export interface Stoppage {
  name: string
  coords: [number, number]
}

export interface Route {
  _id: string
  routeNo: string
  routeName: string
  distance?: number
  travelTime?: number
  routeLine: [number, number][]
  stopages: Stoppage[]
}

export interface Bus {
  _id: string
  name: string
  busType: "AC" | "NON_AC"
  capacity?: number
  status: "active" | "inactive" | "maintenance"
  assignedRouteId?: string
  assignedDriverId?: string
}

export interface POSDevice {
  _id: string
  name?: string
  phoneNumber: string
  status?: "active" | "inactive"
  assignedBus?: string | { _id: string; name: string }
  assignedRoute?: string | { _id: string; routeName: string; routeNo: string }
  deviceId?: string
}


export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Routes", "Buses", "POSDevices"],
  endpoints: (builder) => ({


    getRoutes: builder.query<{ success: boolean; data: Route[] }, void>({
      query: () => ({ url: "/routes" }),
      providesTags: ["Routes"],
    }),
    createRoute: builder.mutation<any, Partial<Route>>({
      query: (newRoute) => ({ url: "/routes", method: "POST", data: newRoute }),
      invalidatesTags: ["Routes"],
    }),
    updateRoute: builder.mutation<any, { id: string; data: Partial<Route> }>({
      query: ({ id, data }) => ({ url: `/routes/${id}`, method: "PUT", data }),
      invalidatesTags: ["Routes"],
    }),
    deleteRoute: builder.mutation<any, string>({
      query: (id) => ({ url: `/routes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Routes"],
    }),


    getBuses: builder.query<{ success: boolean; data: Bus[] }, void>({
      query: () => ({ url: "/buses" }),
      providesTags: ["Buses"],
    }),
    createBus: builder.mutation<any, Partial<Bus>>({
      query: (data) => ({ url: "/buses", method: "POST", data }),
      invalidatesTags: ["Buses"],
    }),
    updateBus: builder.mutation<any, { id: string; data: Partial<Bus> }>({
      query: ({ id, data }) => ({ url: `/buses/${id}`, method: "PUT", data }),
      invalidatesTags: ["Buses"],
    }),
    deleteBus: builder.mutation<any, string>({
      query: (id) => ({ url: `/buses/${id}`, method: "DELETE" }),
      invalidatesTags: ["Buses"],
    }),


    getPOSDevices: builder.query<{ success: boolean; data: POSDevice[] }, void>({
      query: () => ({ url: "/users/pos-device" }),
      providesTags: ["POSDevices"],
    }),
    createPOSDevice: builder.mutation<any, {
      phoneNumber: string
      pin: string
      name?: string
      assignedBus?: string
      assignedRoute?: string
      status?: string
    }>({
      query: (data) => ({ url: "/users/pos-device", method: "POST", data }),
      invalidatesTags: ["POSDevices"],
    }),
    updatePOSDevice: builder.mutation<any, {
      id: string
      data: Partial<{ phoneNumber: string; pin: string; name: string; assignedBus: string; assignedRoute: string; status: string }>
    }>({
      query: ({ id, data }) => ({ url: `/users/pos-device/${id}`, method: "PATCH", data }),
      invalidatesTags: ["POSDevices"],
    }),
    deletePOSDevice: builder.mutation<any, string>({
      query: (id) => ({ url: `/users/pos-device/${id}`, method: "DELETE" }),
      invalidatesTags: ["POSDevices"],
    }),

  }),
})

export const {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useGetBusesQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
  useGetPOSDevicesQuery,
  useCreatePOSDeviceMutation,
  useUpdatePOSDeviceMutation,
  useDeletePOSDeviceMutation,
} = apiSlice

