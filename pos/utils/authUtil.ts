import AsyncStorage from "@react-native-async-storage/async-storage";

import { ASYNC_STORAGE_KEYS } from "@/constants";

export const getAccessToken = async () => AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);

export const setAccessToken = async (token: string) => AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, token);

export const removeAccessToken = async () =>
  AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.AUTH_TOKEN, ASYNC_STORAGE_KEYS.CURRENT_ROUTE]);

export const AuthUtil = {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
};
