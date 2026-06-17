import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react"
import axios, { type AxiosRequestConfig, AxiosError } from "axios"

const axiosBaseQuery = (
  { baseUrl }: { baseUrl: string } = { baseUrl: "" }
): BaseQueryFn<
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
      const token = localStorage.getItem("token")
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
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

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({ baseUrl: "http://localhost:4000/api/v1" }),
  tagTypes: ["Routes"],
  endpoints: (builder) => ({
    getRoutes: builder.query<any, void>({
      query: () => ({ url: "/routes" }),
      providesTags: ["Routes"],
    }),
    createRoute: builder.mutation<any, any>({
      query: (newRoute) => ({
        url: "/routes",
        method: "POST",
        data: newRoute,
      }),
      invalidatesTags: ["Routes"],
    }),
    updateRoute: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/routes/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Routes"],
    }),
    deleteRoute: builder.mutation<any, string>({
      query: (id) => ({
        url: `/routes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Routes"],
    }),
  }),
})

export const {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} = apiSlice
