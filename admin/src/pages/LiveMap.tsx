import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useGetRoutesQuery, useGetBusesQuery, type Route, type Bus } from "@/store/apiSlice"
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  MarkerLabel,
} from "@/components/ui/map"
import { Loader2, Bus as BusIcon } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
interface LiveBus {
  busId: string
  lat: number
  lng: number
  routeId: string
  plateNumber: string // resolved from buses list
  routeName: string   // resolved from routes list
}

// ─── Route colour palette ─────────────────────────────────────────────────────
const ROUTE_COLORS = [
  "#2563EB", "#16A34A", "#DC2626", "#9333EA",
  "#EA580C", "#0891B2", "#CA8A04", "#BE185D",
]

// ─── Bus SVG icon ─────────────────────────────────────────────────────────────
function BusMarkerSvg({ color = "#2563EB" }: { color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: color,
        border: "2.5px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        cursor: "pointer",
      }}
    >
      <BusIcon size={16} color="white" strokeWidth={2.5} />
    </div>
  )
}

// ─── LiveMap page ────────────────────────────────────────────────────────────
export function LiveMap() {
  const { data: routesRes, isLoading: routesLoading } = useGetRoutesQuery()
  const { data: busesRes } = useGetBusesQuery()

  const routes: Route[] = routesRes?.data ?? []
  const buses: Bus[]   = busesRes?.data  ?? []

  // Map of busId → LiveBus
  const [liveBuses, setLiveBuses] = useState<Record<string, LiveBus>>({})
  const socketRef = useRef<Socket | null>(null)

  // Build lookup maps once data is ready
  const routeMap = useRef<Record<string, string>>({})  // routeId → routeName
  const busMap   = useRef<Record<string, string>>({})  // busId   → bus.name (plate)

  useEffect(() => {
    routes.forEach((r) => { routeMap.current[r._id] = r.routeName })
  }, [routes])

  useEffect(() => {
    buses.forEach((b) => { busMap.current[b._id] = b.name })
  }, [buses])

  // ── Socket.IO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on("bus-location-update", (data: {
      busId: string
      routeId: string
      latitude: number
      longitude: number
    }) => {
      const { busId, routeId, latitude, longitude } = data

      setLiveBuses((prev) => ({
        ...prev,
        [busId]: {
          busId,
          lat: latitude,
          lng: longitude,
          routeId,
          plateNumber: busMap.current[busId] ?? busId,
          routeName: routeMap.current[routeId] ?? routeId,
        },
      }))
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const activeBusCount = Object.keys(liveBuses).length
  const mapLoading = routesLoading

  // Assign colours to each route by index
  const routeColorMap: Record<string, string> = {}
  routes.forEach((r, i) => {
    routeColorMap[r._id] = ROUTE_COLORS[i % ROUTE_COLORS.length]
  })

  return (
    <div className="flex flex-col h-full" style={{ height: "calc(100vh - 64px)" }}>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-0 pb-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Live Map
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time bus positions across all active routes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeBusCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {activeBusCount} Active {activeBusCount === 1 ? "Bus" : "Buses"}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 text-sm text-neutral-500 border border-neutral-300 dark:border-neutral-700 rounded-full">
              <span className="h-2 w-2 rounded-full bg-neutral-400 inline-block" />
              No Active Buses
            </div>
          )}
        </div>
      </div>

      {/* ── Map Container ───────────────────────────────────────── */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm min-h-0">
        {mapLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-100/80 dark:bg-neutral-950/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Loading routes…</span>
            </div>
          </div>
        )}

        {/* "No active buses" overlay */}
        {activeBusCount === 0 && !mapLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 shadow-md text-sm text-neutral-500 dark:text-neutral-400 backdrop-blur-sm">
              <BusIcon className="h-4 w-4" />
              No active buses — waiting for location broadcasts
            </div>
          </div>
        )}

        <Map
          viewport={{ center: [90.4125, 23.8103], zoom: 11 }}
          className="h-full w-full"
        >
          <MapControls showZoom showFullscreen />

          {/* ── Route polylines ───────────────────────────────── */}
          {routes.map((route) =>
            route.routeLine?.length >= 2 ? (
              <MapRoute
                key={`route-line-${route._id}`}
                coordinates={route.routeLine}
                color={routeColorMap[route._id]}
                width={3.5}
                opacity={0.75}
              />
            ) : null,
          )}

          {/* ── Stoppage markers ─────────────────────────────── */}
          {routes.flatMap((route) =>
            route.stopages.map((stop, idx) => (
              <MapMarker
                key={`stop-${route._id}-${idx}`}
                longitude={stop.coords[0]}
                latitude={stop.coords[1]}
              >
                <MarkerContent>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: routeColorMap[route._id] ?? "#6B7280",
                      border: "2px solid white",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    }}
                  />
                </MarkerContent>
                <MarkerLabel
                  position="bottom"
                  className="bg-white/95 dark:bg-neutral-900/95 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 rounded shadow text-[9px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap"
                >
                  {stop.name}
                </MarkerLabel>
              </MapMarker>
            )),
          )}

          {/* ── Live bus markers ─────────────────────────────── */}
          {Object.values(liveBuses).map((bus) => (
            <MapMarker
              key={`bus-${bus.busId}`}
              longitude={bus.lng}
              latitude={bus.lat}
            >
              <MarkerContent>
                <BusMarkerSvg color={routeColorMap[bus.routeId] ?? "#2563EB"} />
              </MarkerContent>

              {/* Hover tooltip: plate number */}
              <MarkerLabel
                position="top"
                className="bg-neutral-900/85 text-white px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow"
              >
                {bus.plateNumber}
              </MarkerLabel>

              {/* Click popup: plate + route */}
              <MarkerPopup>
                <div className="p-2.5 min-w-[150px] text-xs">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <BusIcon className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-bold text-neutral-900 dark:text-white font-mono uppercase">
                      {bus.plateNumber}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Route:{" "}
                    <span className="text-neutral-700 dark:text-neutral-200 font-medium capitalize">
                      {bus.routeName}
                    </span>
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </div>
    </div>
  )
}

export default LiveMap
