import { BusFront, History } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

type TopNavProps = {
  title?: string
}

export function TopNav({ title = "Transnova" }: TopNavProps) {
  const location = useLocation()
  const isTripsPage = location.pathname === "/trips"

  return (
    <div className="flex items-center justify-between border-b border-[#e4d9cb] bg-[#f7f2ea] px-4 py-4">
      <Link to="/" className="flex items-center gap-2 text-slate-900">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500 text-white">
          <BusFront className="size-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">Passenger</p>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
      </Link>

      <Link
        to="/trips"
        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition ${
          isTripsPage
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-[#e5ddd1] bg-white text-slate-600 hover:text-slate-900"
        }`}
      >
        <History className="size-4" />
        Trips
      </Link>
    </div>
  )
}
