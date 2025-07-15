import { store } from "@/store/storeConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { ToastUtil } from "./toastUtil";

interface RegistrationFormData {
  name: string;
  routeId: string;
  role: string;
  email: string;
  password: string;
}

const validateRegistrationForm = (formData: RegistrationFormData): boolean => {
  const { name, routeId, role, email, password } = formData;

  if (!name.trim()) {
    ToastUtil.error("Name Required");
    return false;
  }

  if (!routeId) {
    ToastUtil.error("Please select your bus route");
    return false;
  }

  if (!role) {
    ToastUtil.error("Please select your role");
    return false;
  }

  if (!email.trim()) {
    ToastUtil.error("Please enter your email address");
    return false;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    ToastUtil.error("Please enter a valid email address");
    return false;
  }

  if (!password || password.length < 6) {
    ToastUtil.error("Password must be at least 6 characters");
    return false;
  }

  return true;
};

export const getAccessToken = async () => {
  // const state = store.getState();
  // if (state.auth?.accessToken) return state.auth.accessToken;
  return await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
};

export const setAccessToken = async (token: string) => {
  return await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, token);
};

export const removeAccessToken = async () => {
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
};

export const AuthUtil = {
  validateRegistrationForm,
  getAccessToken,
  setAccessToken,
  removeAccessToken,
};
