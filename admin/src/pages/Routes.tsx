import { useState, useEffect, useRef } from "react"
import {
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} from "@/store/apiSlice"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  MarkerLabel,
} from "@/components/ui/map"
import {
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Navigation,
  MapPin,
  Map as MapIcon,
  ShieldAlert,
  X,
} from "lucide-react"

interface Stoppage {
  name: string
  coords: [number, number] // [lng, lat]
}

interface Route {
  _id: string
  routeNo: string
  routeName: string
  distance?: number
  travelTime?: number
  routeLine: [number, number][]
  stopages: Stoppage[]
}

export function Routes() {
  const { data: routesResponse, isLoading } = useGetRoutesQuery()
  const [createRoute, { isLoading: isCreating }] = useCreateRouteMutation()
  const [updateRoute] = useUpdateRouteMutation()
  const [deleteRoute] = useDeleteRouteMutation()

  const routes: Route[] = routesResponse?.data || []

  // Selected Route state
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const selectedRoute = routes.find((r) => r._id === selectedRouteId) || null

  // Stoppages side panel state
  const [isStoppagesPanelOpen, setIsStoppagesPanelOpen] = useState(false)

  // Add Route dialog state
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false)
  const [newRouteNo, setNewRouteNo] = useState("")
  const [newRouteName, setNewRouteName] = useState("")
  const [newRouteLineRaw, setNewRouteLineRaw] = useState("")
  const [newRouteStoppages, setNewRouteStoppages] = useState<Stoppage[]>([])

  // Dynamic stoppage inputs in add route dialog
  const [stoppageInputName, setStoppageInputName] = useState("")
  const [stoppageInputLng, setStoppageInputLng] = useState("")
  const [stoppageInputLat, setStoppageInputLat] = useState("")

  const [addRouteError, setAddRouteError] = useState<string | null>(null)

  // Selected route inline additions
  const [inlineStopName, setInlineStopName] = useState("")
  const [inlineStopLng, setInlineStopLng] = useState("")
  const [inlineStopLat, setInlineStopLat] = useState("")
  const [inlineError, setInlineError] = useState<string | null>(null)

  // Map viewport helper state
  const [mapCenter, setMapCenter] = useState<[number, number]>([90.4125, 23.8103])
  const [mapZoom, setMapZoom] = useState(12)
  const mapRef = useRef<any>(null)

  // Update map viewport when selected route changes
  useEffect(() => {
    if (selectedRoute) {
      if (selectedRoute.stopages.length > 0) {
        const firstStop = selectedRoute.stopages[0]
        setMapCenter(firstStop.coords)
        setMapZoom(13)
        if (mapRef.current) {
          mapRef.current.flyTo({ center: firstStop.coords, zoom: 13, duration: 1200 })
        }
      } else if (selectedRoute.routeLine.length > 0) {
        setMapCenter(selectedRoute.routeLine[0])
        setMapZoom(13)
        if (mapRef.current) {
          mapRef.current.flyTo({ center: selectedRoute.routeLine[0], zoom: 13, duration: 1200 })
        }
      }
    }
  }, [selectedRouteId])

  // Select first route by default on load
  useEffect(() => {
    if (routes.length > 0 && !selectedRouteId) {
      setSelectedRouteId(routes[0]._id)
    }
  }, [routesResponse])

  // Helper to construct dynamic route no recommendation
  const getRecommendedRouteNo = () => {
    if (routes.length === 0) return "R01"
    const numbers = routes
      .map((r) => parseInt(r.routeNo.replace("R", "")))
      .filter((n) => !isNaN(n))
    if (numbers.length === 0) return "R01"
    const max = Math.max(...numbers)
    return `R${(max + 1).toString().padStart(2, "0")}`
  }

  // Handle click on a route in the list — select it and open stoppages panel
  const handleSelectRoute = (routeId: string) => {
    setSelectedRouteId(routeId)
    setIsStoppagesPanelOpen(true)
    setInlineError(null)
  }

  // Handle Add Stoppage in Modal List
  const addStoppageToModalList = () => {
    if (!stoppageInputName || !stoppageInputLng || !stoppageInputLat) {
      alert("Please fill all stoppage fields (name, longitude, latitude)")
      return
    }
    const lng = parseFloat(stoppageInputLng)
    const lat = parseFloat(stoppageInputLat)
    if (isNaN(lng) || isNaN(lat)) {
      alert("Coordinates must be valid numbers")
      return
    }

    const newStop: Stoppage = { name: stoppageInputName, coords: [lng, lat] }
    setNewRouteStoppages((prev) => [...prev, newStop])
    setStoppageInputName("")
    setStoppageInputLng("")
    setStoppageInputLat("")
  }

  // Handle Remove Stoppage in Modal List
  const removeStoppageFromModalList = (index: number) => {
    setNewRouteStoppages((prev) => prev.filter((_, i) => i !== index))
  }

  // Submit Add Route
  const handleAddRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddRouteError(null)

    if (!newRouteNo || !newRouteName) {
      setAddRouteError("Route number and name are required")
      return
    }

    let parsedRouteLine: [number, number][] = []
    try {
      if (newRouteLineRaw.trim()) {
        parsedRouteLine = JSON.parse(newRouteLineRaw)
        if (!Array.isArray(parsedRouteLine) || parsedRouteLine.some((c) => !Array.isArray(c) || c.length !== 2)) {
          throw new Error("Must be a 2D array of coordinate pairs: [[lng, lat], ...]")
        }
      } else {
        if (newRouteStoppages.length > 0) {
          parsedRouteLine = newRouteStoppages.map((s) => s.coords)
        } else {
          parsedRouteLine = [[90.4125, 23.8103]]
        }
      }
    } catch (err: any) {
      setAddRouteError(err.message || "Invalid route line coordinate array format. Example: [[90.41, 23.81], [90.42, 23.82]]")
      return
    }

    try {
      const payload = {
        routeNo: newRouteNo.trim(),
        routeName: newRouteName.trim(),
        routeLine: parsedRouteLine,
        stopages: newRouteStoppages,
      }

      const res = await createRoute(payload).unwrap()
      if (res.success) {
        setIsAddRouteOpen(false)
        setNewRouteNo("")
        setNewRouteName("")
        setNewRouteLineRaw("")
        setNewRouteStoppages([])
        if (res.data?._id) {
          setSelectedRouteId(res.data._id)
          setIsStoppagesPanelOpen(true)
        }
      }
    } catch (err: any) {
      setAddRouteError(err.data?.message || err.message || "Failed to create route")
    }
  }

  // Add Stoppage Inline in Side Panel
  const handleAddStoppageInline = async () => {
    setInlineError(null)
    if (!selectedRoute) return

    if (!inlineStopName || !inlineStopLng || !inlineStopLat) {
      setInlineError("All fields are required")
      return
    }

    const lng = parseFloat(inlineStopLng)
    const lat = parseFloat(inlineStopLat)
    if (isNaN(lng) || isNaN(lat)) {
      setInlineError("Latitude and longitude must be numbers")
      return
    }

    const newStoppage: Stoppage = { name: inlineStopName, coords: [lng, lat] }
    const updatedStoppages = [...selectedRoute.stopages, newStoppage]
    const updatedRouteLine = [...selectedRoute.routeLine, newStoppage.coords]

    try {
      await updateRoute({
        id: selectedRoute._id,
        data: { stopages: updatedStoppages, routeLine: updatedRouteLine },
      }).unwrap()

      setInlineStopName("")
      setInlineStopLng("")
      setInlineStopLat("")
    } catch (err: any) {
      setInlineError(err.data?.message || err.message || "Failed to add stoppage")
    }
  }

  // Delete Stoppage Inline in Side Panel
  const handleDeleteStoppageInline = async (index: number) => {
    if (!selectedRoute) return
    if (!confirm("Are you sure you want to delete this stoppage?")) return

    const targetCoords = selectedRoute.stopages[index].coords
    const updatedStoppages = selectedRoute.stopages.filter((_, i) => i !== index)
    const updatedRouteLine = selectedRoute.routeLine.filter(
      (c) => !(c[0] === targetCoords[0] && c[1] === targetCoords[1])
    )

    try {
      await updateRoute({
        id: selectedRoute._id,
        data: {
          stopages: updatedStoppages,
          routeLine: updatedRouteLine.length > 0 ? updatedRouteLine : [[90.4125, 23.8103]],
        },
      }).unwrap()
    } catch (err: any) {
      alert(err.data?.message || err.message || "Failed to delete stoppage")
    }
  }

  // Reorder Stoppage Inline (Up/Down Arrow click)
  const handleReorderStoppage = async (index: number, direction: "up" | "down") => {
    if (!selectedRoute) return
    const newStoppages = [...selectedRoute.stopages]

    if (direction === "up" && index > 0) {
      const temp = newStoppages[index]
      newStoppages[index] = newStoppages[index - 1]
      newStoppages[index - 1] = temp
    } else if (direction === "down" && index < newStoppages.length - 1) {
      const temp = newStoppages[index]
      newStoppages[index] = newStoppages[index + 1]
      newStoppages[index + 1] = temp
    } else {
      return
    }

    const updatedRouteLine = newStoppages.map((s) => s.coords)

    try {
      await updateRoute({
        id: selectedRoute._id,
        data: { stopages: newStoppages, routeLine: updatedRouteLine },
      }).unwrap()
    } catch (err: any) {
      alert(err.data?.message || err.message || "Failed to reorder stoppages")
    }
  }

  // Delete entire route
  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this route? This action is permanent.")) return
    try {
      await deleteRoute(routeId).unwrap()
      setSelectedRouteId(null)
      setIsStoppagesPanelOpen(false)
    } catch (err: any) {
      alert(err.data?.message || err.message || "Failed to delete route")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
            Routes
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Define route networks, stoppage lists, and inspect coordinate layouts.
          </p>
        </div>
        <Button
          onClick={() => {
            setNewRouteNo(getRecommendedRouteNo())
            setIsAddRouteOpen(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Route
        </Button>
      </div>

      {/* Main Split Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-175px)] min-h-[500px]">

        {/* ── Left Panel: Route Networks List (3 / 10 cols) ── */}
        <Card className="lg:col-span-3 flex flex-col h-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
          <CardHeader className="py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
            <CardTitle className="text-sm font-semibold text-neutral-850 dark:text-neutral-300">
              Route Networks
            </CardTitle>
            <CardDescription className="text-xs">
              Click a route to view its stoppages and map.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                <span className="text-xs text-neutral-500">Loading routes...</span>
              </div>
            ) : routes.length === 0 ? (
              <div className="text-center py-20 text-xs text-neutral-500">No routes registered yet.</div>
            ) : (
              routes.map((route) => {
                const isSelected = route._id === selectedRouteId
                return (
                  <div
                    key={route._id}
                    onClick={() => handleSelectRoute(route._id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm"
                        : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded font-mono text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {route.routeNo}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold capitalize text-neutral-900 dark:text-neutral-50">
                          {route.routeName}
                        </h4>
                        <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {route.stopages.length} stoppages
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteRoute(route._id)
                      }}
                      className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* ── Right Panel: Route Map View (7 / 10 cols) ── */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
          {selectedRoute ? (
            <Card className="flex flex-col h-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
              {/* Map Card Header */}
              <CardHeader className="py-3 px-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 shrink-0 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4 text-neutral-500" />
                  <div>
                    <CardTitle className="text-sm font-semibold text-neutral-850 dark:text-neutral-300">
                      Route Map View
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {selectedRoute.routeNo} · {selectedRoute.routeName}
                    </CardDescription>
                  </div>
                </div>

                {/* Toggle stoppages panel button */}
                <Button
                  size="sm"
                  variant={isStoppagesPanelOpen ? "default" : "outline"}
                  onClick={() => setIsStoppagesPanelOpen((v) => !v)}
                  className="flex items-center gap-2 text-xs h-8"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Stoppages
                  <span
                    className={`inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold ${
                      isStoppagesPanelOpen
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {selectedRoute.stopages.length}
                  </span>
                </Button>
              </CardHeader>

              {/* Map body + slide-in panel */}
              <CardContent className="flex-1 p-0 relative overflow-hidden bg-neutral-100 dark:bg-neutral-950 flex">
                {/* Map */}
                <div className="flex-1 h-full relative">
                  <Map
                    ref={mapRef}
                    viewport={{ center: mapCenter, zoom: mapZoom }}
                    onViewportChange={(v) => {
                      setMapCenter(v.center)
                      setMapZoom(v.zoom)
                    }}
                    className="h-full w-full"
                  >
                    <MapControls showZoom showFullscreen />

                    {/* Stoppage markers with popups */}
                    {selectedRoute.stopages.map((stop, index) => (
                      <MapMarker
                        key={index}
                        longitude={stop.coords[0]}
                        latitude={stop.coords[1]}
                      >
                        <MarkerContent>
                          <div className="relative group">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 border-2 border-white text-white font-mono text-[9px] font-bold shadow-lg cursor-pointer hover:bg-blue-700 hover:scale-110 transition-all">
                              {index + 1}
                            </div>
                          </div>
                        </MarkerContent>

                        <MarkerPopup>
                          <div className="p-2 min-w-[130px] text-xs">
                            <span className="block font-bold text-neutral-900 dark:text-white capitalize mb-1">
                              {stop.name}
                            </span>
                            <span className="block text-[9px] text-neutral-500">Stoppage #{index + 1}</span>
                            <span className="block text-[10px] text-blue-600 font-mono mt-1">
                              {stop.coords[1].toFixed(5)}, {stop.coords[0].toFixed(5)}
                            </span>
                          </div>
                        </MarkerPopup>

                        <MarkerLabel
                          position="bottom"
                          className="bg-white/95 dark:bg-neutral-900/95 border px-1.5 py-0.5 rounded shadow text-[9px]"
                        >
                          {stop.name}
                        </MarkerLabel>
                      </MapMarker>
                    ))}

                    {/* Draw route path line */}
                    {selectedRoute.routeLine && selectedRoute.routeLine.length >= 2 && (
                      <MapRoute
                        coordinates={selectedRoute.routeLine}
                        color="#2563EB"
                        width={4}
                        opacity={0.8}
                      />
                    )}
                  </Map>
                </div>

                {/* ── Stoppages Side Panel (slide-in from right) ── */}
                <div
                  className={`absolute top-0 right-0 h-full z-20 flex flex-col bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all duration-300 ease-in-out ${
                    isStoppagesPanelOpen
                      ? "w-72 opacity-100 pointer-events-auto"
                      : "w-0 opacity-0 pointer-events-none"
                  } overflow-hidden`}
                >
                  {/* Panel Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/40 shrink-0">
                    <div className="min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                        {selectedRoute.routeNo}
                      </span>
                      <h3 className="text-sm font-bold capitalize text-neutral-900 dark:text-neutral-50 leading-tight truncate">
                        {selectedRoute.routeName}
                      </h3>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {selectedRoute.stopages.length} stoppages along route
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsStoppagesPanelOpen(false)}
                      className="h-7 w-7 p-0 shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Stoppage List */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    {selectedRoute.stopages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 px-4 text-center">
                        <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                        </div>
                        <p className="text-xs font-medium text-neutral-500">No stoppages yet</p>
                        <p className="text-[10px] text-neutral-400">Use the form below to add the first stoppage.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {selectedRoute.stopages.map((stop, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2.5 px-3 py-2.5 group hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                          >
                            {/* Numbered pin */}
                            <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold shadow-sm">
                              {index + 1}
                            </div>

                            {/* Stop name & coords */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate capitalize leading-tight">
                                {stop.name}
                              </p>
                              <p className="text-[9px] font-mono text-neutral-400 mt-0.5">
                                {stop.coords[0].toFixed(5)}, {stop.coords[1].toFixed(5)}
                              </p>
                            </div>

                            {/* Actions — visible on hover */}
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === 0}
                                onClick={() => handleReorderStoppage(index, "up")}
                                className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-25"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={index === selectedRoute.stopages.length - 1}
                                onClick={() => handleReorderStoppage(index, "down")}
                                className="h-6 w-6 p-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-25"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStoppageInline(index)}
                                className="h-6 w-6 p-0 text-neutral-300 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inline Add Stoppage Form */}
                  <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/40 shrink-0 space-y-2">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                      <Plus className="h-3 w-3 text-blue-500" /> Add Stoppage
                    </h5>
                    <Input
                      placeholder="Stoppage name"
                      value={inlineStopName}
                      onChange={(e) => setInlineStopName(e.target.value)}
                      className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Longitude"
                        value={inlineStopLng}
                        onChange={(e) => setInlineStopLng(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                      />
                      <Input
                        placeholder="Latitude"
                        value={inlineStopLat}
                        onChange={(e) => setInlineStopLat(e.target.value)}
                        className="h-8 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                      />
                    </div>
                    {inlineError && (
                      <span className="text-[10px] text-red-500 block font-medium">{inlineError}</span>
                    )}
                    <Button
                      onClick={handleAddStoppageInline}
                      size="sm"
                      className="h-8 text-xs w-full flex items-center justify-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Insert Stoppage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center h-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center p-12">
              <Navigation className="h-10 w-10 text-neutral-300 animate-pulse mb-3" />
              <CardTitle className="text-neutral-800 dark:text-neutral-200 text-sm">No Route Selected</CardTitle>
              <CardDescription className="text-xs">
                Choose a route from the left panel to view its map and stoppages.
              </CardDescription>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog: Add Route */}
      <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
        <DialogContent className="sm:max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Route Network</DialogTitle>
            <DialogDescription>
              Register a new smart transport route line. You can input route line coordinates and initial stoppages.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRouteSubmit}>
            <div className="space-y-4 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="routeNo" className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Route Number
                  </label>
                  <Input
                    id="routeNo"
                    placeholder="e.g. R01"
                    value={newRouteNo}
                    onChange={(e) => setNewRouteNo(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="routeName" className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Route Name
                  </label>
                  <Input
                    id="routeName"
                    placeholder="e.g. Uttara to Motijheel"
                    value={newRouteName}
                    onChange={(e) => setNewRouteName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Route Line coordinates textarea */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="routeLine"
                  className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between"
                >
                  <span>Route Path Coordinates (2D Array)</span>
                  <span className="text-[10px] font-normal text-neutral-500">Optional</span>
                </label>
                <textarea
                  id="routeLine"
                  placeholder="e.g. [[90.41, 23.81], [90.42, 23.82]]"
                  value={newRouteLineRaw}
                  onChange={(e) => setNewRouteLineRaw(e.target.value)}
                  className="w-full h-20 px-3 py-2 border rounded-md font-mono text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              {/* Stoppages list builder */}
              <div className="space-y-2 border border-neutral-100 dark:border-neutral-850 p-4 rounded-lg bg-neutral-50/30 dark:bg-neutral-950/20">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">Add Stoppages</h4>

                {/* Form inline inputs */}
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Stop Name"
                    value={stoppageInputName}
                    onChange={(e) => setStoppageInputName(e.target.value)}
                    className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  />
                  <Input
                    placeholder="Longitude"
                    value={stoppageInputLng}
                    onChange={(e) => setStoppageInputLng(e.target.value)}
                    className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  />
                  <Input
                    placeholder="Latitude"
                    value={stoppageInputLat}
                    onChange={(e) => setStoppageInputLat(e.target.value)}
                    className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                  />
                </div>
                <Button type="button" onClick={addStoppageToModalList} size="sm" variant="outline" className="h-8 text-xs w-full">
                  <Plus className="h-3 w-3 mr-1" /> Add Stoppage to List
                </Button>

                {/* Stoppages List preview */}
                {newRouteStoppages.length > 0 && (
                  <div className="border rounded-md divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden max-h-36 overflow-y-auto mt-2">
                    {newRouteStoppages.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 text-xs">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {idx + 1}. {st.name} ({st.coords[0].toFixed(4)}, {st.coords[1].toFixed(4)})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStoppageFromModalList(idx)}
                          className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {addRouteError && (
                <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>{addRouteError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddRouteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Create Route"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
