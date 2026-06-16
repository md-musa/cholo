import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import { IUser } from "@/store/features/route/route.interface";

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { phoneNumber: string; pin: string; role?: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
    }),
    getUser: builder.query<IUser, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetUserQuery } = authApi;
