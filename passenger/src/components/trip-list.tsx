import type { TripItem } from "@/types"

type TripListProps = {
  trips: TripItem[]
}

export function TripList({ trips }: TripListProps) {
  return (
    <div className="rounded-[28px] border border-[#e2d8cb] bg-[#fffdf9] p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Last 5 Trips</h3>
        <p className="text-sm text-slate-500">Recent completed trips from your passenger account.</p>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ddd2c3] bg-[#fcfaf6] px-4 py-6 text-center text-sm text-slate-500">
          No trip history yet.
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <div key={trip._id} className="rounded-2xl border border-[#ece4d8] bg-[#fcfaf6] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {trip.routeId?.routeNo ? `${trip.routeId.routeNo} · ${trip.routeId.routeName}` : trip.routeId?.routeName || "Unknown Route"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Status: {trip.fareStatus || trip.status}</div>
                </div>
                <div
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    trip.fareStatus === "deducted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {trip.fareStatus || trip.status}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Distance" value={typeof trip.distanceInKm === "number" ? `${trip.distanceInKm.toFixed(2)} km` : "--"} />
                <Metric label="Fare" value={typeof trip.fare === "number" ? `${trip.fare} BDT` : "--"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
