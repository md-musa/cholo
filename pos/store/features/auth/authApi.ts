// src/store/api/authApi.ts
import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { IUser } from "@/store/features/route/route.interface";

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
    }),

    register: builder.mutation<any, IUser>({
      query: (newUser) => ({
        url: "/auth/register",
        method: "POST",
        data: newUser,
      }),
    }),

    getUser: builder.query<any, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetUserQuery } = authApi;
