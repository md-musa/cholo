import apiClient from "../config/axiosConfig";


export const registerUser = async (data) => {
  return await apiClient.post("/auth/register", data);
};
// hello
export const loginUser = async (data) => {
  return await apiClient.post("/auth/login", data);
};
