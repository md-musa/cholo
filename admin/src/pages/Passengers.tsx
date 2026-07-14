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


  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8


  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(
    null
  )
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  console.log(recentTrips)
  const token = localStorage.getItem("token")

  const fetchPassengers = async () => {
    setLoading(true)
    setError(null)
    try {
      const passengerRes = await fetch(
        "https://cholo-production.up.railway.app/api/v1/users/passenger",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      const passengerResult = await passengerRes.json()
      console.log(passengerResult)
      if (!passengerRes.ok || !passengerResult.success)
        throw new Error(
          passengerResult.message || "Failed to retrieve passengers list"
        )

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

  useEffect(() => {
    fetchPassengers()
  }, [])

  const handleViewPassenger = async (passenger: Passenger) => {
    setSelectedPassenger(passenger)
    setIsDetailOpen(true)
    setRecentTrips([])
    setTripsLoading(true)
    try {
      const res = await fetch(
        `https://cholo-production.up.railway.app/api/v1/trip/history/${passenger._id}?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)


  const Avatar = ({
    passenger,
    size = "md",
  }: {
    passenger: Passenger
    size?: "sm" | "md" | "lg"
  }) => {
    const dims =
      size === "lg"
        ? "h-20 w-20 text-2xl"
        : size === "sm"
          ? "h-8 w-8 text-xs"
          : "h-10 w-10 text-sm"

    const hue =
      passenger.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      360
    const bg = `hsl(${hue}, 55%, 88%)`
    const fg = `hsl(${hue}, 55%, 32%)`

    if (passenger.avatar) {
      return (
        <img
          src={passenger.avatar}
          alt={passenger.name}
          className={`${dims} flex-shrink-0 rounded-full border-2 border-white object-cover shadow-sm dark:border-neutral-800`}
        />
      )
    }
    return (
      <div
        className={`${dims} flex flex-shrink-0 items-center justify-center rounded-full border-2 border-white font-bold shadow-sm dark:border-neutral-800`}
        style={{ backgroundColor: bg, color: fg }}
      >
        {getInitials(passenger.name)}
      </div>
    )
  }


  const CardBadge = ({ card }: { card?: Card }) => {
    if (!card || card.status === "unissued") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
          <CreditCard className="h-2.5 w-2.5" /> No card
        </span>
      )
    }
    if (card.status === "blocked") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          <Ban className="h-2.5 w-2.5" /> Blocked
        </span>
      )
    }
    if (card.status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
          <CreditCard className="h-2.5 w-2.5" /> Expired
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400">
        <BadgeCheck className="h-2.5 w-2.5" /> Active
      </span>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Passengers
            </h1>
            {!loading && (
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {filteredPassengers.length} Total
              </span>
            )}
          </div>
        </div>
      </div>


      <div className="flex items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-neutral-200 bg-white pl-9 dark:border-neutral-800 dark:bg-neutral-900"
          />
        </div>
      </div>


      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      <CardContainer className="overflow-hidden border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
              <span className="text-sm text-neutral-500">
                Loading passengers...
              </span>
            </div>
          ) : paginatedPassengers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <User className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-500">
                No passengers found matching the criteria.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">

              <div className="grid grid-cols-[2.5fr_1.5fr_1.5fr_1.2fr_auto] gap-4 bg-neutral-50 px-5 py-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:bg-neutral-900/60 dark:text-neutral-400">
                <span>Passenger</span>
                <span>Contact</span>
                <span>Linked Card</span>
                <span>Balance</span>
                <span className="w-9" />
              </div>


              {paginatedPassengers.map((passenger) => {
                const card = cardMap[passenger._id]
                const isBlocked = card?.status === "blocked"
                return (
                  <div
                    key={passenger._id}
                    className={`group grid grid-cols-[2.5fr_1.5fr_1.5fr_1.2fr_auto] items-center gap-4 px-5 py-3.5 transition-colors ${
                      isBlocked
                        ? "bg-red-50/30 hover:bg-red-50/50 dark:bg-red-950/10 dark:hover:bg-red-950/20"
                        : "hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20"
                    }`}
                  >

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative">
                        <Avatar passenger={passenger} size="md" />
                        {isBlocked && (
                          <span className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-red-500 dark:border-neutral-900">
                            <Ban className="h-2 w-2 text-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm leading-tight font-semibold text-neutral-900 dark:text-neutral-50">
                          {passenger.name}
                        </p>
                        {passenger.email && (
                          <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                            {passenger.email}
                          </p>
                        )}
                        {passenger.discountType && (
                          <span className="mt-1 inline-block rounded border border-blue-100 bg-blue-50 px-1.5 py-0 text-[9px] font-bold text-blue-600 uppercase dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-400">
                            {passenger.discountType}
                          </span>
                        )}
                      </div>
                    </div>


                    <div className="flex min-w-0 items-center gap-2">
                      <Phone className="text-neutral-350 h-3.5 w-3.5 shrink-0 dark:text-neutral-500" />
                      <span className="truncate font-mono text-sm text-neutral-700 dark:text-neutral-300">
                        {passenger.phoneNumber}
                      </span>
                    </div>


                    <div className="flex min-w-0 flex-col gap-1">
                      <CardBadge card={card} />
                      {card?.nfcUid && (
                        <span className="truncate font-mono text-[10px] text-neutral-400">
                          {card.nfcUid}
                        </span>
                      )}
                    </div>


                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          isBlocked
                            ? "text-red-600 dark:text-red-400"
                            : "text-neutral-900 dark:text-neutral-50"
                        }`}
                      >
                        ৳{(card?.balance ?? passenger.balance).toFixed(2)}
                      </span>
                    </div>


                    <div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewPassenger(passenger)}
                        className="h-8 w-8 rounded-full p-0 text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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


      {!loading && filteredPassengers.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <span className="dark:text-neutral-450 text-sm text-neutral-500">
            Showing{" "}
            {Math.min(
              filteredPassengers.length,
              (currentPage - 1) * itemsPerPage + 1
            )}
            –{Math.min(filteredPassengers.length, currentPage * itemsPerPage)}{" "}
            of {filteredPassengers.length} passengers
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
            <span className="px-2 text-sm font-semibold tabular-nums">
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


      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full overflow-y-auto border-l border-neutral-200 bg-white px-4 sm:max-w-md dark:border-neutral-800 dark:bg-neutral-900">
          <SheetHeader>
            <SheetTitle>Passenger Profile</SheetTitle>
            <SheetDescription>
              Detailed record of travel account status.
            </SheetDescription>
          </SheetHeader>

          {selectedPassenger && (
            <div className="space-y-6 py-6">

              <div className="relative overflow-hidden rounded-2xl border border-neutral-100 bg-gradient-to-br from-neutral-50 to-neutral-100/60 p-5 dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-950/40">
                <div className="flex items-start gap-4">

                  <Avatar passenger={selectedPassenger} size="lg" />

                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-xl leading-tight font-bold text-neutral-900 dark:text-neutral-50">
                      {selectedPassenger.name}
                    </h3>
                    <p className="font-mono text-sm text-neutral-500">
                      {selectedPassenger.phoneNumber}
                    </p>
                    {selectedPassenger.email && (
                      <p className="truncate text-xs text-neutral-400">
                        {selectedPassenger.email}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="inline-flex items-center rounded-full bg-neutral-200/70 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        Passenger
                      </span>
                      {selectedPassenger.discountType && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase dark:bg-blue-950/40 dark:text-blue-400">
                          {selectedPassenger.discountType}
                        </span>
                      )}
                      {selectedPassenger.isBlocked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                          <Ban className="h-2.5 w-2.5" /> Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>


              {(() => {
                const card = cardMap[selectedPassenger._id]
                return (
                  <div className="grid grid-cols-2 gap-3">

                    <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/20">
                      <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                        Card Balance
                      </span>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-blue-500" />
                        <span className="text-2xl leading-none font-extrabold text-neutral-900 tabular-nums dark:text-neutral-50">
                          ৳
                          {(card?.balance ?? selectedPassenger.balance).toFixed(
                            2
                          )}
                        </span>
                      </div>
                      {(selectedPassenger.discount ?? 0) > 0 && (
                        <span className="mt-1 text-[10px] font-semibold text-green-600 dark:text-green-400">
                          {selectedPassenger.discount}% discount active
                        </span>
                      )}
                      {card?.lastUsedAt && (
                        <span className="mt-1 text-[10px] text-neutral-400">
                          Last used:{" "}
                          {new Date(card.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>


                    <div className="flex flex-col gap-1 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/20">
                      <span className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                        NFC Card
                      </span>
                      <div className="mt-1">
                        <CardBadge card={card} />
                      </div>
                      {card?.nfcUid ? (
                        <span className="mt-1 font-mono text-[10px] break-all text-neutral-500">
                          {card.nfcUid}
                        </span>
                      ) : (
                        <span className="mt-1 text-[10px] text-neutral-400">
                          No card linked
                        </span>
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


              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                  Contact Info
                </h4>
                <div className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50/10 text-sm dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-950/10">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {selectedPassenger.phoneNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {selectedPassenger.email || "No email provided"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="h-4 w-4 shrink-0 text-neutral-400" />
                    <span className="text-neutral-800 dark:text-neutral-200">
                      Joined{" "}
                      {new Date(selectedPassenger.createdAt).toLocaleDateString(
                        undefined,
                        { dateStyle: "long" }
                      )}
                    </span>
                  </div>
                </div>
              </div>


              <div className="space-y-2">
                <h4 className="text-xs font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
                  Recent Trips (Last 5)
                </h4>
                {tripsLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                    <span className="text-xs text-neutral-500">
                      Loading trip history...
                    </span>
                  </div>
                ) : recentTrips.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-neutral-200 py-6 text-center text-sm text-neutral-400 italic dark:border-neutral-800">
                    No trips recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentTrips.map((trip) => (
                      <div
                        key={trip._id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/20 px-4 py-3 text-xs dark:border-neutral-800 dark:bg-neutral-950/10"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="truncate font-semibold text-neutral-800 dark:text-neutral-200">
                            {trip.routeId?.routeName}
                          </p>

                          <p className="text-[10px] text-neutral-400">
                            <span className="font-mono text-neutral-800 dark:text-neutral-200">
                              {new Date(trip.checkinTime).toLocaleTimeString()}
                            </span>
                            <span>{" -> "}</span>
                            <span className="font-mono text-neutral-800 dark:text-neutral-200">
                              {trip.checkoutTime
                                ? new Date(
                                    trip.checkoutTime
                                  ).toLocaleTimeString()
                                : "Active"}
                            </span>
                          </p>
                          <p className="font-mono text-[10px] text-neutral-400">
                            {trip.distanceInKm.toFixed(2) + "Km"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {trip.fareStatus === "deducted" ? (
                            <span className="font-bold text-neutral-900 dark:text-neutral-50">
                              ৳{trip.fare}
                            </span>
                          ) : (
                            <span className="font-semibold text-red-500 capitalize">
                              {trip.fareStatus}
                            </span>
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
