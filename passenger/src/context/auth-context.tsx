import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import axiosInstance from "@/config/axios.config"
import type { ApiResponse, PassengerUser } from "@/types"

type AuthContextValue = {
  isAuthenticated: boolean
  isBootstrapping: boolean
  user: PassengerUser | null
  login: (token: string, user: PassengerUser) => void
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PassengerUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("passenger_token")
    const storedUser = localStorage.getItem("passenger_user")

    if (!storedToken || !storedUser) {
      setIsBootstrapping(false)
      return
    }

    try {
      setUser(JSON.parse(storedUser) as PassengerUser)
    } catch {
      localStorage.removeItem("passenger_token")
      localStorage.removeItem("passenger_user")
    } finally {
      setIsBootstrapping(false)
    }
  }, [])

  const login = useCallback((token: string, nextUser: PassengerUser) => {
    localStorage.setItem("passenger_token", token)
    localStorage.setItem("passenger_user", JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("passenger_token")
    localStorage.removeItem("passenger_user")
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const storedUser = localStorage.getItem("passenger_user")
    const parsedUser = storedUser ? (JSON.parse(storedUser) as PassengerUser) : null

    if (!parsedUser?._id) {
      return
    }

    const response = await axiosInstance.get<ApiResponse<PassengerUser>>("/auth/user", {
      params: { userId: parsedUser._id },
    })

    localStorage.setItem("passenger_user", JSON.stringify(response.data.data))
    setUser(response.data.data)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      isBootstrapping,
      user,
      login,
      refreshUser,
      logout,
    }),
    [isBootstrapping, login, logout, refreshUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
