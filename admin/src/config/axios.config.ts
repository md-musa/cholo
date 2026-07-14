import axios from "axios"


export const BASE_URL = "https://cholo-production.up.railway.app/api/v1"
export const serverURL = "https://cholo-production.up.railway.app"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})


axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("admin_name")
      localStorage.removeItem("admin_role")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
