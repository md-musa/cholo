import { Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { PassengerLiveMap } from "@/components/passenger-live-map"
import { MobileShell } from "@/components/mobile-shell"
import { ProfileCard } from "@/components/profile-card"
import { RechargeModal } from "@/components/recharge-modal"
import { StatusBanner } from "@/components/status-banner"
import { TopNav } from "@/components/top-nav"
import axiosInstance from "@/config/axios.config"
import { useAuth } from "@/context/auth-context"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ApiResponse, BusItem, CardInfo, PassengerProfile, RouteItem } from "@/types"

export function HomePage() {
  const { logout, refreshUser, user } = useAuth()
  const userId = user?._id
  const [card, setCard] = useState<CardInfo | null>(null)
  const [routes, setRoutes] = useState<RouteItem[]>([])
  const [buses, setBuses] = useState<BusItem[]>([])
  const [loading, setLoading] = useState(true)
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const [rechargeLoading, setRechargeLoading] = useState(false)
  const [notice, setNotice] = useState<{ message: string; tone: "error" | "success" } | null>(null)

  const loadDashboard = useCallback(async () => {
    if (!userId) {
      return
    }

    const [profileResponse, routesResponse, busesResponse] = await Promise.all([
      axiosInstance.get<ApiResponse<PassengerProfile>>(`/users/passenger/${userId}`),
      axiosInstance.get<ApiResponse<RouteItem[]>>("/routes"),
      axiosInstance.get<ApiResponse<BusItem[]>>("/buses"),
    ])

    setCard(profileResponse.data.data.card ?? null)
    setRoutes(routesResponse.data.data)
    setBuses(busesResponse.data.data)
  }, [userId])

  useEffect(() => {
    if (!userId) return

    setLoading(true)
    refreshUser()
      .then(() => loadDashboard())
      .catch((error: unknown) => {
        setNotice({ message: getErrorMessage(error, "Failed to load passenger dashboard."), tone: "error" })
      })
      .finally(() => setLoading(false))
  }, [loadDashboard, refreshUser, userId])

  const handleRecharge = async (amount: number) => {
    setRechargeLoading(true)

    try {
      await axiosInstance.post<ApiResponse<CardInfo & { rechargedAmount: number }>>("/card/recharge", { amount })

      if (userId) {
        await loadDashboard()
      }

      setNotice({ message: `Recharge completed successfully for ${amount} BDT.`, tone: "success" })
    } catch (error) {
      throw new Error(getErrorMessage(error, "Recharge could not be completed."))
    } finally {
      setRechargeLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <MobileShell>
      <div className="relative flex flex-1 flex-col">
        <TopNav />
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {notice ? <StatusBanner message={notice.message} tone={notice.tone} /> : null}

          {loading ? (
            <div className="flex min-h-[240px] items-center justify-center rounded-[28px] border border-[#e2d8cb] bg-[#fffdf9]">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" />
                Loading passenger dashboard
              </div>
            </div>
          ) : (
            <>
              <ProfileCard user={user} card={card} onRecharge={() => setRechargeOpen(true)} onLogout={logout} />
              <PassengerLiveMap routes={routes} buses={buses} />
            </>
          )}
        </div>

        <RechargeModal
          open={rechargeOpen}
          loading={rechargeLoading}
          onClose={() => setRechargeOpen(false)}
          onSubmit={handleRecharge}
        />
      </div>
    </MobileShell>
  )
}
