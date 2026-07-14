import { useEffect, useMemo, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import {
  useGetRoutesQuery,
  useGetBusesQuery,
  type Route,
  type Bus,
} from "@/store/apiSlice"
import {
  Map,
  MapControls,
  MapMarker,
  useMap,
  MarkerContent,
  MarkerPopup,
  MarkerLabel,
} from "@/components/ui/map"
import { Loader2, Bus as BusIcon } from "lucide-react"
import { serverURL } from "@/config/axios.config"

// ─── Types ───────────────────────────────────────────────────────────────────
interface LiveBus {
  busId: string
  lat: number
  lng: number
  routeId: string
  plateNumber: string // resolved from buses list
  routeName: string // resolved from routes list
}

// ─── Route colour palette ─────────────────────────────────────────────────────
const ROUTE_COLORS = [
  "#2563EB",
  "#16A34A",
  "#DC2626",
  "#9333EA",
  "#EA580C",
  "#0891B2",
  "#CA8A04",
  "#BE185D",
]

// ─── RouteLines — draws route polylines directly via MapLibre API ─────────────
// Uses useMap() inside the <Map> tree to avoid MapRoute's two-effect race
function RouteLines({
  routes,
  colorMap,
}: {
  routes: Route[]
  colorMap: Record<string, string>
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const addedSources: string[] = []
    const addedLayers: string[] = []

    routes.forEach((route) => {
      const coords: [number, number][] = (route.routeLine ?? []).map(
        (pt: any): [number, number] =>
          Array.isArray(pt)
            ? [pt[0], pt[1]]
            : [pt.lng ?? pt.longitude, pt.lat ?? pt.latitude]
      )
      if (coords.length < 2) return

      const sourceId = `rl-src-${route._id}`
      const layerId = `rl-lay-${route._id}`

      try {
        // Clean up stale layer/source from a previous render first
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: coords },
          },
        })

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": colorMap[route._id] ?? "#4285F4",
            "line-width": 3.5,
            "line-opacity": 0.75,
          },
        })

        addedSources.push(sourceId)
        addedLayers.push(layerId)
      } catch (err) {
        console.warn("RouteLines: failed to add route", route._id, err)
      }
    })

    return () => {
      addedLayers.forEach((id) => {
        try {
          if (map.getLayer(id)) map.removeLayer(id)
        } catch {}
      })
      addedSources.forEach((id) => {
        try {
          if (map.getSource(id)) map.removeSource(id)
        } catch {}
      })
    }
    // Re-run when the map is ready OR routes/colors change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, isLoaded, routes, colorMap])

  return null
}

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
  const buses: Bus[] = busesRes?.data ?? []

  // Map of busId → LiveBus
  const [liveBuses, setLiveBuses] = useState<Record<string, LiveBus>>({})
  const socketRef = useRef<Socket | null>(null)

  // Build lookup maps once data is ready
  const routeMap = useRef<Record<string, string>>({}) // routeId → routeName
  const busMap = useRef<Record<string, string>>({}) // busId   → bus.name (plate)

  useEffect(() => {
    routes.forEach((r) => {
      routeMap.current[r._id] = r.routeName
    })
  }, [routes])

  useEffect(() => {
    buses.forEach((b) => {
      busMap.current[b._id] = b.name
    })
  }, [buses])

  // ── Socket.IO ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(serverURL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on(
      "bus-location-update",
      (data: {
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
      }
    )

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const activeBusCount = Object.keys(liveBuses).length
  const mapLoading = routesLoading

  // Assign colours to each route by index — memoized so the object reference
  // only changes when routes actually change (prevents RouteLines from re-firing on every render)
  const routeColorMap = useMemo(() => {
    const map: Record<string, string> = {}
    routes.forEach((r, i) => {
      map[r._id] = ROUTE_COLORS[i % ROUTE_COLORS.length]
    })
    return map
  }, [routes])

  return (
    <div
      className="flex h-full flex-col"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center justify-between px-0 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Live Map
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {activeBusCount > 0 ? (
            <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:border-green-800 dark:bg-green-900/40 dark:text-green-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              {activeBusCount} Active {activeBusCount === 1 ? "Bus" : "Buses"}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-500 dark:border-neutral-700">
              <span className="inline-block h-2 w-2 rounded-full bg-neutral-400" />
              No Active Buses
            </div>
          )}
        </div>
      </div>

      {/* ── Map Container ───────────────────────────────────────── */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-200 shadow-sm dark:border-neutral-800">
        {mapLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-100/80 backdrop-blur-sm dark:bg-neutral-950/80">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Loading routes…
              </span>
            </div>
          </div>
        )}

        {/* "No active buses" overlay */}
        {activeBusCount === 0 && !mapLoading && (
          <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2">
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm text-neutral-500 shadow-md backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-400">
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

          {/* ── Route polylines — via direct MapLibre API ──────────── */}
          <RouteLines routes={routes} colorMap={routeColorMap} />

          {/* ── Stoppage dot markers — rendered on top of route lines ── */}
          {routes.flatMap((route) =>
            (route.stopages ?? []).map((stop, idx) => {
              // stop.coords is [lng, lat] per the admin routes form
              const rawCoords: any = stop.coords
              const lng: number = Array.isArray(rawCoords)
                ? rawCoords[0]
                : (rawCoords.lng ?? rawCoords.longitude)
              const lat: number = Array.isArray(rawCoords)
                ? rawCoords[1]
                : (rawCoords.lat ?? rawCoords.latitude)

              return (
                <MapMarker
                  key={`stop-${route._id}-${idx}`}
                  longitude={lng}
                  latitude={lat}
                >
                  {/* MarkerContent portals into marker.getElement() so both
                      the dot AND the label follow the marker on map move */}
                  <MarkerContent>
                    <div style={{ position: "relative" }}>
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
                      {/* Label inside the portal so it follows the marker */}
                      <MarkerLabel
                        position="bottom"
                        className="rounded border border-neutral-200 bg-white/95 px-1.5 py-0.5 text-[9px] whitespace-nowrap text-neutral-700 shadow dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-300"
                      >
                        {stop.name}
                      </MarkerLabel>
                    </div>
                  </MarkerContent>
                </MapMarker>
              )
            })
          )}

          {/* ── Live bus markers ─────────────────────────────── */}
          {Object.values(liveBuses).map((bus) => (
            <MapMarker
              key={`bus-${bus.busId}`}
              longitude={bus.lng}
              latitude={bus.lat}
            >
              {/* Icon + name label both inside the portal so they follow the marker */}
              <MarkerContent>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <BusMarkerSvg
                    color={routeColorMap[bus.routeId] ?? "#2563EB"}
                  />
                  <MarkerLabel
                    position="bottom"
                    className="rounded bg-neutral-900/85 px-2 py-0.5 font-mono text-[10px] whitespace-nowrap text-white shadow"
                  >
                    {bus.plateNumber}
                  </MarkerLabel>
                </div>
              </MarkerContent>

              {/* Click popup: name + route */}
              <MarkerPopup>
                <div className="min-w-[150px] p-2.5 text-xs">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <BusIcon className="h-3.5 w-3.5 text-blue-600" />
                    <span className="font-mono font-bold text-neutral-900 uppercase dark:text-white">
                      {bus.plateNumber}
                    </span>
                  </div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                    Route:{" "}
                    <span className="font-medium text-neutral-700 capitalize dark:text-neutral-200">
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
