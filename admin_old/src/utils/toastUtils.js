// src/utils/toastUtils.js
import { toast } from "react-hot-toast";

export const showSuccess = (message = "Success!") => {
  toast.success(message);
};

export const showError = (message = "Something went wrong!") => {
  toast.error(message);
};

export const showLoading = (message = "Loading...") => {
  return toast.loading(message); // returns toastId
};

export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

export const updateToast = (toastId, options = {}) => {
  toast.dismiss(toastId); // optional: remove old
  if (options.type === "success") toast.success(options.message || "Done");
  else if (options.type === "error") toast.error(options.message || "Error");
};
export const showInfo = (message = "Info") => {
  toast(message);
};