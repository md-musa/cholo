import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import authReducer from "./features/auth/authSlice";
import { authApi } from "./features/auth/authApi";
import { busApi } from "./features/bus/busApi";
import { routeApi } from "./features/route/routeApi";
import { tripApi } from "./features/trip/tripApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [routeApi.reducerPath]: routeApi.reducer,
    [busApi.reducerPath]: busApi.reducer,
    [tripApi.reducerPath]: tripApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, routeApi.middleware, busApi.middleware, tripApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
