import { History } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

type TopNavProps = {
  title?: string
}

export function TopNav({ title = "Cholo" }: TopNavProps) {
  const location = useLocation()
  const isTripsPage = location.pathname === "/trips"

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5">
      <Link to="/" className="text-slate-900 hover:opacity-95 transition">
        {title === "Cholo" ? (
          <h1 className="text-lg font-black tracking-widest text-slate-900 uppercase">CHOLO</h1>
        ) : (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-900 leading-none mb-0.5">CHOLO</p>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">{title}</h1>
          </div>
        )}
      </Link>

      <Link
        to="/trips"
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
          isTripsPage
            ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
            : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
        }`}
      >
        <History className="size-4" />
        Trips
      </Link>
    </div>
  )
}
