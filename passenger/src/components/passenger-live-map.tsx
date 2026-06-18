import { Bus as BusIcon, Loader2, MapPinned } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  useMap,
} from "@/components/ui/map"
import type { BusItem, LiveBus, RouteItem } from "@/types"

const ROUTE_COLORS = ["#2563eb", "#10b981", "#e11d48", "#f97316", "#0f766e", "#7c3aed", "#ca8a04", "#0891b2"]

function RouteLines({
  routes,
  colorMap,
}: {
  routes: RouteItem[]
  colorMap: Record<string, string>
}) {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const sources: string[] = []
    const layers: string[] = []

    routes.forEach((route) => {
      if ((route.routeLine || []).length < 2) return

      const sourceId = `passenger-route-src-${route._id}`
      const layerId = `passenger-route-layer-${route._id}`

      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route.routeLine,
            },
          },
        })

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": colorMap[route._id] ?? "#2563eb",
            "line-width": 3.5,
            "line-opacity": 0.72,
          },
        })

        sources.push(sourceId)
        layers.push(layerId)
      } catch {
        // ignore map race cleanup
      }
    })

    return () => {
      layers.forEach((layerId) => {
        try {
          if (map.getLayer(layerId)) map.removeLayer(layerId)
        } catch {
          // ignore
        }
      })

      sources.forEach((sourceId) => {
        try {
          if (map.getSource(sourceId)) map.removeSource(sourceId)
        } catch {
          // ignore
        }
      })
    }
  }, [colorMap, isLoaded, map, routes])

  return null
}

function BusMarker({ color }: { color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: "999px",
        background: color,
        border: "2px solid white",
        boxShadow: "0 10px 18px rgba(15, 23, 42, 0.18)",
      }}
    >
      <BusIcon size={14} color="white" strokeWidth={2.4} />
    </div>
  )
}

type PassengerLiveMapProps = {
  routes: RouteItem[]
  buses: BusItem[]
}

export function PassengerLiveMap({ routes, buses }: PassengerLiveMapProps) {
  const [liveBuses, setLiveBuses] = useState<Record<string, LiveBus>>({})
  const [isConnecting, setIsConnecting] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const routeLookupRef = useRef<Record<string, string>>({})
  const busLookupRef = useRef<Record<string, string>>({})

  const routeLookup = useMemo(
    () =>
      Object.fromEntries(routes.map((route) => [route._id, route.routeName])),
    [routes],
  )
  const busLookup = useMemo(
    () =>
      Object.fromEntries(buses.map((bus) => [bus._id, bus.name])),
    [buses],
  )

  useEffect(() => {
    routeLookupRef.current = routeLookup
  }, [routeLookup])

  useEffect(() => {
    busLookupRef.current = busLookup
  }, [busLookup])

  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on("connect", () => setIsConnecting(false))
    socket.on("disconnect", () => setIsConnecting(false))
    socket.on("bus-location-update", (data: { busId: string; routeId: string; latitude: number; longitude: number }) => {
      setIsConnecting(false)
      setLiveBuses((current) => ({
        ...current,
        [data.busId]: {
          busId: data.busId,
          routeId: data.routeId,
          lat: data.latitude,
          lng: data.longitude,
          plateNumber: busLookupRef.current[data.busId] ?? data.busId,
          routeName: routeLookupRef.current[data.routeId] ?? data.routeId,
        },
      }))
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const routeColors = useMemo(() => {
    const result: Record<string, string> = {}
    routes.forEach((route, index) => {
      result[route._id] = ROUTE_COLORS[index % ROUTE_COLORS.length]
    })
    return result
  }, [routes])

  return (
    <div className="rounded-[28px] border border-[#e2d8cb] bg-[#fffdf9] p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Live Routes</h3>
          <p className="text-sm text-slate-500">All routes and shared buses in one view.</p>
        </div>
        <div className="rounded-full bg-[#f3ede4] px-3 py-1 text-xs font-semibold text-slate-600">
          {Object.keys(liveBuses).length} active
        </div>
      </div>

      <div className="relative h-[320px] overflow-hidden rounded-[24px] border border-[#e7dfd4]">
        {routes.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-[#fcfaf6] text-sm text-slate-500">
            Loading routes...
          </div>
        ) : (
          <>
            {isConnecting ? (
              <div className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#e7dfd4] bg-white/90 px-3 py-1.5 text-xs text-slate-500 shadow-sm backdrop-blur-sm">
                <Loader2 className="size-3.5 animate-spin" />
                Connecting live buses
              </div>
            ) : null}

            {Object.keys(liveBuses).length === 0 && !isConnecting ? (
              <div className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#e7dfd4] bg-white/90 px-3 py-1.5 text-xs text-slate-500 shadow-sm backdrop-blur-sm">
                <MapPinned className="size-3.5" />
                Waiting for shared bus locations
              </div>
            ) : null}

            <Map viewport={{ center: [90.4125, 23.8103], zoom: 11 }} className="h-full w-full" theme="light">
              <MapControls showZoom showFullscreen />
              <RouteLines routes={routes} colorMap={routeColors} />

              {routes.flatMap((route) =>
                route.stopages.map((stop, index) => (
                  <MapMarker key={`${route._id}-${index}`} longitude={stop.coords[0]} latitude={stop.coords[1]}>
                    <MarkerContent>
                      <div style={{ position: "relative" }}>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "999px",
                            background: routeColors[route._id] ?? "#64748b",
                            border: "2px solid white",
                          }}
                        />
                        <MarkerLabel
                          position="bottom"
                          className="rounded bg-white/95 px-1.5 py-0.5 text-[9px] text-slate-600 shadow"
                        >
                          {stop.name}
                        </MarkerLabel>
                      </div>
                    </MarkerContent>
                  </MapMarker>
                )),
              )}

              {Object.values(liveBuses).map((bus) => (
                <MapMarker key={bus.busId} longitude={bus.lng} latitude={bus.lat}>
                  <MarkerContent>
                    <div style={{ position: "relative" }}>
                      <BusMarker color={routeColors[bus.routeId] ?? "#2563eb"} />
                      <MarkerLabel position="bottom" className="rounded bg-slate-900/85 px-2 py-0.5 text-[10px] text-white shadow">
                        {bus.plateNumber}
                      </MarkerLabel>
                    </div>
                  </MarkerContent>
                  <MarkerPopup>
                    <div className="rounded-xl border border-[#e7dfd4] bg-white px-3 py-2 text-xs text-slate-600 shadow">
                      <p className="font-semibold text-slate-900">{bus.plateNumber}</p>
                      <p className="mt-1">{bus.routeName}</p>
                    </div>
                  </MarkerPopup>
                </MapMarker>
              ))}
            </Map>
          </>
        )}
      </div>
    </div>
  )
}
