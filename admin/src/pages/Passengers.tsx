import { useState, useEffect } from "react"
import { Card as CardContainer, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, Eye, ShieldAlert, ArrowLeft, ArrowRight, CreditCard, Calendar, Phone, Mail } from "lucide-react"

interface Passenger {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  nfcUid?: string
  balance: number
  isBlocked: boolean
  createdAt: string
}

export function Passengers() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Passenger Detail Sheet States
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)

  const token = localStorage.getItem("token")

  const fetchPassengers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:4000/api/v1/users/passenger", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to retrieve passengers list")
      }

      setPassengers(result.data || [])
    } catch (err: any) {
      setError(err.message || "Something went wrong while loading passengers.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPassengers()
  }, [])

  // Open Details Sheet & Fetch Trip History (GET /trip/history/:userId)
  const handleViewPassenger = async (passenger: Passenger) => {
    setSelectedPassenger(passenger)
    setIsDetailOpen(true)
    setRecentTrips([])
    setTripsLoading(true)

    try {
      const res = await fetch(`http://localhost:4000/api/v1/trip/history/${passenger._id}?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setRecentTrips(result.data || [])
      }
    } catch (err) {
      console.error("Failed to load passenger trip history", err)
    } finally {
      setTripsLoading(false)
    }
  }

  // Filter passengers based on Search Term (name or phone)
  const filteredPassengers = passengers.filter((p) => {
    const term = searchTerm.toLowerCase()
    return p.name.toLowerCase().includes(term) || p.phoneNumber.includes(term)
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredPassengers.length / itemsPerPage) || 1
  const paginatedPassengers = filteredPassengers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Helper for name initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Passengers
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {filteredPassengers.length} Total
              </span>
            )}
          </div>
          <p className="text-neutral-500 dark:text-neutral-400">
            View registered passenger accounts and their transit histories.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Passengers Table Container */}
      <CardContainer className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
              <span className="text-sm text-neutral-500">Loading passengers list...</span>
            </div>
          ) : paginatedPassengers.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-neutral-500">
              No passengers found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Name</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Phone</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Email</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300 text-center">Card Status</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Balance</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Joined Date</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPassengers.map((passenger) => {
                    // Card Status logic:
                    // If no nfcUid -> none = gray
                    // If isBlocked -> blocked = red
                    // If has nfcUid and not blocked -> active = green
                    let cardStatus = "none"
                    let badgeStyle = "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-750"

                    if (passenger.nfcUid) {
                      if (passenger.isBlocked) {
                        cardStatus = "blocked"
                        badgeStyle = "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                      } else {
                        cardStatus = "active"
                        badgeStyle = "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50"
                      }
                    }

                    return (
                      <TableRow key={passenger._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                        <TableCell className="font-medium text-neutral-850 dark:text-neutral-200">
                          {passenger.name}
                        </TableCell>
                        <TableCell className="text-neutral-600 dark:text-neutral-350">
                          {passenger.phoneNumber}
                        </TableCell>
                        <TableCell className="text-neutral-500 dark:text-neutral-450">
                          {passenger.email || "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle} capitalize`}>
                            {cardStatus}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-neutral-800 dark:text-neutral-250">
                          ৳{passenger.balance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-neutral-500 dark:text-neutral-450">
                          {new Date(passenger.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewPassenger(passenger)}
                            className="h-8 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 p-2"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </CardContainer>

      {/* Pagination Controls */}
      {!loading && filteredPassengers.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-neutral-500 dark:text-neutral-450">
            Showing {Math.min(filteredPassengers.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
            {Math.min(filteredPassengers.length, currentPage * itemsPerPage)} of {filteredPassengers.length} passengers
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Sheet: Passenger Detail */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Passenger Profile</SheetTitle>
            <SheetDescription>Detailed record of travel account status.</SheetDescription>
          </SheetHeader>
          {selectedPassenger && (
            <div className="space-y-6 py-6">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 border border-neutral-100 dark:border-neutral-800 p-4 rounded-xl bg-neutral-50/20 dark:bg-neutral-950/20">
                <div className="h-16 w-16 rounded-full border border-neutral-200 dark:border-neutral-850 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
                  <span className="text-xl font-bold">{getInitials(selectedPassenger.name)}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-50">{selectedPassenger.name}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
                    Passenger Account
                  </span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Contact Info</h4>
                <div className="border border-neutral-100 dark:border-neutral-850 p-4 rounded-lg bg-neutral-50/10 dark:bg-neutral-950/10 space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200">{selectedPassenger.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200">{selectedPassenger.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200">
                      Joined: {new Date(selectedPassenger.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linked Card Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Transit Card</h4>
                {selectedPassenger.nfcUid ? (
                  <div className="border border-neutral-100 dark:border-neutral-850 p-4 rounded-lg bg-neutral-50/10 dark:bg-neutral-950/10 space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4 w-4 text-neutral-400 shrink-0" />
                      <div>
                        <span className="block text-xs text-neutral-500">NFC Card ID (UID)</span>
                        <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{selectedPassenger.nfcUid}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="block text-xs text-neutral-500">Card Balance</span>
                        <span className="font-bold text-neutral-900 dark:text-neutral-50">৳{selectedPassenger.balance.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-neutral-500">Card Status</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-50 capitalize">
                          {selectedPassenger.isBlocked ? (
                            <span className="text-red-500">Blocked</span>
                          ) : (
                            <span className="text-green-500">Active</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm italic text-neutral-500 bg-neutral-50/50 dark:bg-neutral-950/10 p-4 rounded-lg border border-dashed text-center">
                    No active NFC card linked to this passenger.
                  </div>
                )}
              </div>

              {/* Recent Trips */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Recent Trips (Last 5)</h4>
                {tripsLoading ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                    <span className="text-xs text-neutral-500">Loading trip history...</span>
                  </div>
                ) : recentTrips.length === 0 ? (
                  <div className="text-sm italic text-neutral-500 text-center py-4">
                    No trips recorded yet.
                  </div>
                ) : (
                  <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden text-xs">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-neutral-50 dark:bg-neutral-900/50">
                          <TableHead className="font-semibold">Stops</TableHead>
                          <TableHead className="text-right font-semibold">Fare</TableHead>
                          <TableHead className="text-right font-semibold">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTrips.map((trip) => (
                          <TableRow key={trip._id}>
                            <TableCell className="py-2.5">
                              <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {trip.startStoppage} → {trip.endStoppage || "Active"}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-mono">
                                {trip.routeId?.routeNo || "Route No"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-2.5 font-medium">
                              {trip.fareStatus === "deducted" ? `৳${trip.fare}` : <span className="text-red-500 font-normal capitalize">{trip.fareStatus}</span>}
                            </TableCell>
                            <TableCell className="text-right py-2.5 text-neutral-550 dark:text-neutral-450">
                              {trip.checkoutTime ? new Date(trip.checkoutTime).toLocaleDateString() : new Date(trip.checkinTime).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
