import { useState, useEffect } from "react"
import { Card as CardContainer, CardContent } from "@/components/ui/card"
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
import {
  Loader2,
  Search,
  Eye,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  User,
  Wallet,
  BadgeCheck,
  Ban,
} from "lucide-react"

interface Passenger {
  _id: string
  name: string
  phoneNumber: string
  email?: string
  avatar?: string
  nfcUid?: string
  balance: number
  isBlocked: boolean
  discount?: number
  discountType?: string | null
  createdAt: string
}

interface Card {
  _id: string
  nfcUid: string
  userId: string | null
  balance: number
  status: "unissued" | "active" | "blocked" | "expired"
  issuedAt: string | null
  lastUsedAt: string | null
}

export function Passengers() {
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [cardMap, setCardMap] = useState<Record<string, Card>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log(passengers)

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Detail Sheet
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null)
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  console.log(recentTrips)
  const token = localStorage.getItem("token")

  const fetchPassengers = async () => {
    setLoading(true)
    setError(null)
    try {
      const passengerRes = await fetch("http://localhost:4000/api/v1/users/passenger", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const passengerResult = await passengerRes.json()
      if (!passengerRes.ok || !passengerResult.success)
        throw new Error(passengerResult.message || "Failed to retrieve passengers list")

      const cards: Card[] = passengerResult.data || []
      const passengerList: Passenger[] = []
      const map: Record<string, Card> = {}

      for (const card of cards) {
        if (card.userId && typeof card.userId === "object") {
          const passenger = card.userId as unknown as Passenger
          passengerList.push(passenger)
          map[passenger._id] = card
        }
      }

      setPassengers(passengerList)
      setCardMap(map)
    } catch (err: any) {
      setError(err.message || "Something went wrong while loading passengers.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPassengers() }, [])

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
      if (res.ok && result.success) setRecentTrips(result.data || [])
    } catch (err) {
      console.error("Failed to load passenger trip history", err)
    } finally {
      setTripsLoading(false)
    }
  }

  const filteredPassengers = passengers.filter((p) => {
    const term = searchTerm.toLowerCase()
    return p.name.toLowerCase().includes(term) || p.phoneNumber.includes(term)
  })

  const totalPages = Math.ceil(filteredPassengers.length / itemsPerPage) || 1
  const paginatedPassengers = filteredPassengers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  useEffect(() => { setCurrentPage(1) }, [searchTerm])

  const getInitials = (name: string) =>
    name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2)

  // Avatar component — shows image if available, else coloured initials bubble
  const Avatar = ({ passenger, size = "md" }: { passenger: Passenger; size?: "sm" | "md" | "lg" }) => {
    const dims = size === "lg" ? "h-20 w-20 text-2xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
    // Generate a consistent hue from the name
    const hue = passenger.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    const bg = `hsl(${hue}, 55%, 88%)`
    const fg = `hsl(${hue}, 55%, 32%)`

    if (passenger.avatar) {
      return (
        <img
          src={passenger.avatar}
          alt={passenger.name}
          className={`${dims} rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm flex-shrink-0`}
        />
      )
    }
    return (
      <div
        className={`${dims} rounded-full flex items-center justify-center font-bold flex-shrink-0 border-2 border-white dark:border-neutral-800 shadow-sm`}
        style={{ backgroundColor: bg, color: fg }}
      >
        {getInitials(passenger.name)}
      </div>
    )
  }

  // Card status badge — driven by CardModel.status (the real source of truth)
  const CardBadge = ({ card }: { card?: Card }) => {
    if (!card || card.status === "unissued") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
          <CreditCard className="h-2.5 w-2.5" /> No card
        </span>
      )
    }
    if (card.status === "blocked") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50">
          <Ban className="h-2.5 w-2.5" /> Blocked
        </span>
      )
    }
    if (card.status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
          <CreditCard className="h-2.5 w-2.5" /> Expired
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50">
        <BadgeCheck className="h-2.5 w-2.5" /> Active
      </span>
    )
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

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Passengers List */}
      <CardContainer className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              <span className="text-sm text-neutral-500">Loading passengers...</span>
            </div>
          ) : paginatedPassengers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <User className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-500">No passengers found matching the criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {/* Table Header */}
              <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-5 py-3 bg-neutral-50 dark:bg-neutral-900/60 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <span>Passenger</span>
                <span>Contact</span>
                <span>Linked Card</span>
                <span>Balance</span>
                <span className="w-9" />
              </div>

              {/* Rows */}
              {paginatedPassengers.map((passenger) => {
                const card = cardMap[passenger._id]
                const isBlocked = card?.status === "blocked"
                return (
                  <div
                    key={passenger._id}
                    className={`grid grid-cols-[2.5fr_1.5fr_1.5fr_1.2fr_auto] gap-4 px-5 py-3.5 items-center transition-colors group ${isBlocked
                      ? "bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50 dark:hover:bg-red-950/20"
                      : "hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20"
                      }`}
                  >
                    {/* ── Avatar + Name ── */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <Avatar passenger={passenger} size="md" />
                        {isBlocked && (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                            <Ban className="h-2 w-2 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 truncate leading-tight">
                          {passenger.name}
                        </p>
                        {passenger.email && (
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                            {passenger.email}
                          </p>
                        )}
                        {passenger.discountType && (
                          <span className="inline-block mt-1 px-1.5 py-0 rounded text-[9px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                            {passenger.discountType}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Phone ── */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="h-3.5 w-3.5 text-neutral-350 dark:text-neutral-500 shrink-0" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300 font-mono truncate">
                        {passenger.phoneNumber}
                      </span>
                    </div>

                    {/* ── Linked Card (from CardModel) ── */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <CardBadge card={card} />
                      {card?.nfcUid && (
                        <span className="font-mono text-[10px] text-neutral-400 truncate">
                          {card.nfcUid}
                        </span>
                      )}
                    </div>

                    {/* ── Balance (from CardModel) ── */}
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                      <span className={`text-sm font-bold tabular-nums ${isBlocked ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-50"
                        }`}>
                        ৳{(card?.balance ?? passenger.balance).toFixed(2)}
                      </span>
                    </div>

                    {/* ── View button ── */}
                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewPassenger(passenger)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </CardContainer>

      {/* Pagination */}
      {!loading && filteredPassengers.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-450">
            Showing {Math.min(filteredPassengers.length, (currentPage - 1) * itemsPerPage + 1)}–
            {Math.min(filteredPassengers.length, currentPage * itemsPerPage)} of {filteredPassengers.length} passengers
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold px-2 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Sheet: Passenger Profile ── */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full px-4 sm:max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Passenger Profile</SheetTitle>
            <SheetDescription>Detailed record of travel account status.</SheetDescription>
          </SheetHeader>

          {selectedPassenger && (
            <div className="space-y-6 py-6">

              {/* ── Profile Hero Card ── */}
              <div className="relative rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-neutral-100/60 dark:from-neutral-900 dark:to-neutral-950/40 p-5">
                <div className="flex items-start gap-4">
                  {/* Large Avatar */}
                  <Avatar passenger={selectedPassenger} size="lg" />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-neutral-50 leading-tight">
                      {selectedPassenger.name}
                    </h3>
                    <p className="text-sm text-neutral-500 font-mono">{selectedPassenger.phoneNumber}</p>
                    {selectedPassenger.email && (
                      <p className="text-xs text-neutral-400 truncate">{selectedPassenger.email}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-200/70 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        Passenger
                      </span>
                      {selectedPassenger.discountType && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                          {selectedPassenger.discountType}
                        </span>
                      )}
                      {selectedPassenger.isBlocked && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                          <Ban className="h-2.5 w-2.5" /> Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Balance + Card ── */}
              {(() => {
                const card = cardMap[selectedPassenger._id]
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Balance tile */}
                    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 p-4 flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Card Balance</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Wallet className="h-4 w-4 text-blue-500" />
                        <span className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-50 tabular-nums leading-none">
                          ৳{(card?.balance ?? selectedPassenger.balance).toFixed(2)}
                        </span>
                      </div>
                      {(selectedPassenger.discount ?? 0) > 0 && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-1">
                          {selectedPassenger.discount}% discount active
                        </span>
                      )}
                      {card?.lastUsedAt && (
                        <span className="text-[10px] text-neutral-400 mt-1">
                          Last used: {new Date(card.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Card tile */}
                    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 p-4 flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">NFC Card</span>
                      <div className="mt-1">
                        <CardBadge card={card} />
                      </div>
                      {card?.nfcUid ? (
                        <span className="font-mono text-[10px] text-neutral-500 break-all mt-1">
                          {card.nfcUid}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400 mt-1">No card linked</span>
                      )}
                      {card?.issuedAt && (
                        <span className="text-[10px] text-neutral-400">
                          Issued: {new Date(card.issuedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* ── Contact Info ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Contact Info
                </h4>
                <div className="border border-neutral-100 dark:border-neutral-800 rounded-xl bg-neutral-50/10 dark:bg-neutral-950/10 divide-y divide-neutral-100 dark:divide-neutral-800 text-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200 font-mono">{selectedPassenger.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200">{selectedPassenger.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span className="text-neutral-800 dark:text-neutral-200">
                      Joined {new Date(selectedPassenger.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Recent Trips ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Recent Trips (Last 5)
                </h4>
                {tripsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    <span className="text-xs text-neutral-500">Loading trip history...</span>
                  </div>
                ) : recentTrips.length === 0 ? (
                  <div className="text-sm italic text-neutral-400 text-center py-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                    No trips recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTrips.map((trip) => (
                      <div
                        key={trip._id}
                        className="border border-neutral-100 dark:border-neutral-800 rounded-xl px-4 py-3 text-xs flex items-start justify-between gap-3 bg-neutral-50/20 dark:bg-neutral-950/10"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                            {trip.routeId?.routeName}
                          </p>

                          <p className="text-[10px] text-neutral-400">
                            <span className="text-neutral-800 dark:text-neutral-200 font-mono">{new Date(trip.checkinTime).toLocaleTimeString()}</span>
                            <span>{' -> '}</span>
                            <span className="text-neutral-800 dark:text-neutral-200 font-mono">{trip.checkoutTime
                              ? new Date(trip.checkoutTime).toLocaleTimeString()
                              : 'Active'}</span>
                          </p>
                          <p className="text-[10px] text-neutral-400 font-mono">
                            {trip.distanceInKm.toFixed(2) + 'Km'}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {trip.fareStatus === "deducted" ? (
                            <span className="font-bold text-neutral-900 dark:text-neutral-50">৳{trip.fare}</span>
                          ) : (
                            <span className="text-red-500 font-semibold capitalize">{trip.fareStatus}</span>
                          )}
                        </div>
                      </div>
                    ))}
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
