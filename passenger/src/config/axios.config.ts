import axios from "axios"

// export const BASE_URL = "http://localhost:4000/api/v1"
export const BASE_URL = "https://cholo-production.up.railway.app/api/v1"
export const serverURL = "https://cholo-production.up.railway.app"

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("passenger_token")
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
      localStorage.removeItem("passenger_token")
      localStorage.removeItem("passenger_user")
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
