import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

import { MobileShell } from "@/components/mobile-shell"
import { StatusBanner } from "@/components/status-banner"
import { TopNav } from "@/components/top-nav"
import axiosInstance from "@/config/axios.config"
import { useAuth } from "@/context/auth-context"
import { getErrorMessage } from "@/lib/get-error-message"
import type { ApiResponse, TripItem } from "@/types"

export function TripsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [trips, setTrips] = useState<TripItem[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user?._id) {
      return
    }

    setLoading(true)
    axiosInstance
      .get<ApiResponse<TripItem[]>>(`/trip/history/${user._id}`, {
        params: { limit: 5, page: 1 },
      })
      .then((response) => {
        setTrips(response.data.data)
        setError("")
      })
      .catch((nextError) => {
        setError(getErrorMessage(nextError, "Failed to load trip history."))
      })
      .finally(() => setLoading(false))
  }, [user?._id])

  return (
    <MobileShell>
      <TopNav title="Trip History" />
      <div className="flex-1 overflow-y-auto p-4">
        {error ? <StatusBanner message={error} /> : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Last 10 Trips</h2>
            <p className="text-sm text-slate-500">Simple trip history for passenger use.</p>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading trips
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
              No trips found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Route</th>
                    <th className="px-3 py-3 font-medium">Distance</th>
                    <th className="px-3 py-3 font-medium">Fare</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip._id} className="border-t border-slate-200 bg-white hover:bg-slate-50/50 transition">
                      <td className="px-3 py-3 text-slate-900">
                        {trip.routeId?.routeNo ? `${trip.routeId.routeNo} · ${trip.routeId.routeName}` : trip.routeId?.routeName || "Unknown Route"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {typeof trip.distanceInKm === "number" ? `${trip.distanceInKm.toFixed(2)} km` : "--"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {typeof trip.fare === "number" ? `${trip.fare} BDT` : "--"}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${trip.fareStatus === "deducted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {trip.fareStatus || trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  )
}
