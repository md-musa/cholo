import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { AuthCard } from "@/components/auth-card"
import { MobileShell } from "@/components/mobile-shell"
import axiosInstance from "@/config/axios.config"
import { useAuth } from "@/context/auth-context"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ApiResponse, PassengerUser } from "@/types"

type AuthPayload = {
  name?: string
  phoneNumber: string
  pin: string
  mode: "login" | "register"
}

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleAuth = async ({ mode, ...payload }: AuthPayload) => {
    setLoading(true)

    try {
      const url = mode === "register" ? "/auth/registration" : "/auth/login"
      const response = await axiosInstance.post<ApiResponse<{ accessToken: string; user: PassengerUser }>>(url, {
        ...payload,
        role: "passenger",
      })

      login(response.data.data.accessToken, response.data.data.user)
      navigate("/", { replace: true })
    } catch (error) {
      throw new Error(getErrorMessage(error, "Unable to continue with passenger account."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <MobileShell>
      <div className="flex flex-1 flex-col justify-center p-5">
        <AuthCard loading={loading} onSubmit={handleAuth} />
      </div>
    </MobileShell>
  )
}
