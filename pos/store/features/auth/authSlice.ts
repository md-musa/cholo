// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IUser, IRoute } from "@/store/features/route/route.interface";
import { USER_ROLES } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthUser {
  _id: string;
  role: USER_ROLES;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  route: IRoute | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  route: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.route = action.payload.route;
      state.accessToken = action.payload.accessToken;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.route = null;
      state.accessToken = null;
    },
    updateRoute: (state, action: PayloadAction<IRoute | null>) => {
      state.route = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateRoute } = authSlice.actions;
export default authSlice.reducer;
