import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { Easing } from "react-native-reanimated";

const DEFAULT_CONFIG = {
  duration: 3000,
  position: ToastPosition.TOP,
  animationConfig: {
    duration: 500,
    flingPositionReturnDuration: 200,
    easing: Easing.elastic(1),
  },
};

const showToast = (msg: string) => {
  toast(msg, { ...DEFAULT_CONFIG, icon: "💬" });
};

const showSuccess = (msg: string) => {
  toast.success(msg, { ...DEFAULT_CONFIG, icon: "✅" });
};

const showError = (msg: string) => {
  toast.error(msg, { ...DEFAULT_CONFIG, icon: "❌" });
};

const showLoading = (msg: string) => {
  return toast.loading(msg, { ...DEFAULT_CONFIG, duration: Infinity, icon: "⏳" });
};

const updateLoading = (id: string, successMsg: string) => {
  toast.success(successMsg, { ...DEFAULT_CONFIG, id, icon: "✅" });
};

const dismissToast = (id?: string) => {
  id ? toast.dismiss(id) : toast.dismiss();
};

export const ToastUtil = {
  toast: showToast,
  success: showSuccess,
  error: showError,
  loading: showLoading,
  updateLoading: updateLoading,
  dismiss: dismissToast,
};
