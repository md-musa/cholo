import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { USER_ROLES } from "@/constants";
import { IRoute, IUser } from "@/store/features/route/route.interface";

export interface AuthUser {
  _id: string;
  name?: string;
  role: USER_ROLES;
  email: string;
  //routeId?: IRoute | null;
}

interface AuthState {
  user: AuthUser | null;
  route: IRoute | null;
  bus: any | null;
  accessToken: string | null;
}

const initialState: AuthState = {
  user: null,
  route: null,
  bus: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
      state.route = action.payload.route;
      state.bus = action.payload.bus;
      state.accessToken = action.payload.accessToken;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.route = null;
      state.bus = null;
      state.accessToken = null;
    },
    updateRoute: (state, action: PayloadAction<IRoute | null>) => {
      state.route = action.payload;
    },
    updateBus: (state, action: PayloadAction<any | null>) => {
      state.bus = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateRoute, updateBus } = authSlice.actions;
export default authSlice.reducer;
