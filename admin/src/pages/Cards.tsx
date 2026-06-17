import { useState, useEffect } from "react"
import { Card as CardContainer, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Plus, Search, Eye, Ban, ShieldAlert, ArrowLeft, ArrowRight, UserCheck } from "lucide-react"

interface Passenger {
  _id: string
  name: string
  phoneNumber: string
  email?: string
}

interface Card {
  _id: string
  nfcUid: string
  userId: Passenger | null
  balance: number
  status: "unissued" | "active" | "blocked" | "expired"
  createdAt: string
  updatedAt: string
  issuedAt: string | null
  lastUsedAt: string | null
}

export function Cards() {
  // Lists & Data State
  const [cards, setCards] = useState<Card[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Dialog & Sheet States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [registerNfcUid, setRegisterNfcUid] = useState("")
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerLoading, setRegisterLoading] = useState(false)

  const [isIssueOpen, setIsIssueOpen] = useState(false)
  const [selectedCardToIssue, setSelectedCardToIssue] = useState<Card | null>(null)
  const [passengerSearch, setPassengerSearch] = useState("")
  const [selectedPassengerId, setSelectedPassengerId] = useState("")
  const [issueError, setIssueError] = useState<string | null>(null)
  const [issueLoading, setIssueLoading] = useState(false)

  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedCardDetail, setSelectedCardDetail] = useState<Card | null>(null)
  const [recentTrips, setRecentTrips] = useState<any[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const token = localStorage.getItem("token")

  const fetchCardsAndPassengers = async () => {
    setLoading(true)
    setError(null)
    try {
      const cardsRes = await fetch("http://localhost:4000/api/v1/card", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const cardsResult = await cardsRes.json()

      const passengersRes = await fetch("http://localhost:4000/api/v1/users/passenger", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const passengersResult = await passengersRes.json()

      if (!cardsRes.ok || !cardsResult.success) {
        throw new Error(cardsResult.message || "Failed to load cards")
      }

      setCards(cardsResult.data || [])
      if (passengersRes.ok && passengersResult.success) {
        setPassengers(passengersResult.data || [])
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while loading data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCardsAndPassengers()
  }, [])

  // Register New Card (POST /card)
  const handleRegisterCard = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)
    setRegisterLoading(true)

    try {
      const res = await fetch("http://localhost:4000/api/v1/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nfcUid: registerNfcUid }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to register card")
      }

      setIsRegisterOpen(false)
      setRegisterNfcUid("")
      fetchCardsAndPassengers()
    } catch (err: any) {
      setRegisterError(err.message || "Failed to register new card.")
    } finally {
      setRegisterLoading(false)
    }
  }

  // Issue Card (PATCH /card/:id/issue)
  const handleIssueCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCardToIssue || !selectedPassengerId) return
    setIssueError(null)
    setIssueLoading(true)

    try {
      const res = await fetch(`http://localhost:4000/api/v1/card/${selectedCardToIssue._id}/issue`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: selectedPassengerId }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to issue card")
      }

      setIsIssueOpen(false)
      setSelectedCardToIssue(null)
      setSelectedPassengerId("")
      setPassengerSearch("")
      fetchCardsAndPassengers()
    } catch (err: any) {
      setIssueError(err.message || "Failed to issue card to passenger.")
    } finally {
      setIssueLoading(false)
    }
  }

  // Block Card (PATCH /card/:id/block)
  const handleBlockCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to block this card? This action will disable NFC check-in/out.")) return
    setActionLoadingId(cardId)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/card/${cardId}/block`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to block card")
      }
      fetchCardsAndPassengers()
    } catch (err: any) {
      alert(err.message || "Error blocking card")
    } finally {
      setActionLoadingId(null)
    }
  }

  // Unblock Card (PATCH /card/:id/unblock)
  const handleUnblockCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to unblock this card?")) return
    setActionLoadingId(cardId)
    try {
      const res = await fetch(`http://localhost:4000/api/v1/card/${cardId}/unblock`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to unblock card")
      }
      fetchCardsAndPassengers()
    } catch (err: any) {
      alert(err.message || "Error unblocking card")
    } finally {
      setActionLoadingId(null)
    }
  }

  // View Card Details Sheet & Fetch Trip History (GET /trip/history/:userId)
  const handleViewCard = async (card: Card) => {
    setSelectedCardDetail(card)
    setIsDetailOpen(true)
    setRecentTrips([])

    if (card.userId?._id) {
      setTripsLoading(true)
      try {
        const res = await fetch(`http://localhost:4000/api/v1/trip/history/${card.userId._id}?limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const result = await res.json()
        if (res.ok && result.success) {
          setRecentTrips(result.data || [])
        }
      } catch (err) {
        console.error("Failed to load passenger trips", err)
      } finally {
        setTripsLoading(false)
      }
    }
  }

  // Filter passenger options inside the Issue Card modal based on query
  const filteredPassengers = passengers.filter((p) => {
    const q = passengerSearch.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.phoneNumber.includes(q)
  })

  // Filter cards based on UID search and status dropdown
  const filteredCards = cards.filter((card) => {
    const matchUid = card.nfcUid.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === "all" || card.status === statusFilter
    return matchUid && matchStatus
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredCards.length / itemsPerPage) || 1
  const paginatedCards = filteredCards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Cards</h1>
          <p className="text-neutral-500 dark:text-neutral-400">Manage NFC transit cards, issue to passengers, or block access.</p>
        </div>
        <Button onClick={() => setIsRegisterOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Register New Card
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by NFC UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
          />
        </div>

        {/* Dropdown Status Filter */}
        <div className="w-full sm:max-w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="unissued">Unissued</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cards Table Container */}
      <CardContainer className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
              <span className="text-sm text-neutral-500">Loading cards list...</span>
            </div>
          ) : paginatedCards.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-sm text-neutral-500">
              No cards found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">NFC UID</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Passenger</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Balance</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Status</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Issued Date</TableHead>
                    <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCards.map((card) => {
                    // Status Badge Styling
                    let statusStyle = "bg-neutral-100 text-neutral-800 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700"
                    if (card.status === "active") {
                      statusStyle = "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50"
                    } else if (card.status === "blocked") {
                      statusStyle = "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                    } else if (card.status === "expired") {
                      statusStyle = "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50"
                    }

                    return (
                      <TableRow key={card._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/20">
                        <TableCell className="font-mono text-sm text-neutral-800 dark:text-neutral-250 font-medium">
                          {card.nfcUid}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-600 dark:text-neutral-350">
                          {card.userId ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-neutral-850 dark:text-neutral-200">{card.userId.name}</span>
                              <span className="text-xs text-neutral-450 dark:text-neutral-500">{card.userId.phoneNumber}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic text-xs">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-neutral-800 dark:text-neutral-250 font-semibold">
                          ৳{card.balance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusStyle} capitalize`}>
                            {card.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-neutral-500 dark:text-neutral-450">
                          {card.issuedAt ? new Date(card.issuedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Issue Button */}
                            {card.status === "unissued" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedCardToIssue(card)
                                  setIsIssueOpen(true)
                                }}
                                className="h-8 text-xs flex items-center gap-1 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              >
                                <UserCheck className="h-3 w-3" /> Issue
                              </Button>
                            )}

                            {/* Block / Unblock Button */}
                            {card.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === card._id}
                                onClick={() => handleBlockCard(card._id)}
                                className="h-8 text-xs text-red-650 hover:text-red-700 dark:text-red-400 border-neutral-200 dark:border-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                {actionLoadingId === card._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Ban className="h-3 w-3 mr-1" /> Block
                                  </>
                                )}
                              </Button>
                            )}
                            {card.status === "blocked" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoadingId === card._id}
                                onClick={() => handleUnblockCard(card._id)}
                                className="h-8 text-xs text-green-650 hover:text-green-700 dark:text-green-400 border-neutral-200 dark:border-neutral-800 hover:bg-green-50 dark:hover:bg-green-950/20"
                              >
                                {actionLoadingId === card._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  "Unblock"
                                )}
                              </Button>
                            )}

                            {/* View Details Button */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewCard(card)}
                              className="h-8 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 p-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
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
      {!loading && filteredCards.length > 0 && (
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-neutral-500 dark:text-neutral-450">
            Showing {Math.min(filteredCards.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
            {Math.min(filteredCards.length, currentPage * itemsPerPage)} of {filteredCards.length} cards
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

      {/* Dialog: Register New Card */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Register New Card</DialogTitle>
            <DialogDescription>
              Input the NFC Unique Identifier (UID) to pre-register it into the transit system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterCard}>
            <div className="space-y-4 py-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="nfcUid" className="text-sm font-medium">NFC UID</label>
                <Input
                  id="nfcUid"
                  placeholder="e.g. 04:A3:2B:12:3C:5D:80"
                  value={registerNfcUid}
                  onChange={(e) => setRegisterNfcUid(e.target.value)}
                  required
                />
              </div>

              {registerError && (
                <Alert variant="destructive">
                  <AlertDescription>{registerError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={registerLoading}>
                {registerLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...
                  </>
                ) : (
                  "Register Card"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Issue Card */}
      <Dialog open={isIssueOpen} onOpenChange={setIsIssueOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Issue Card</DialogTitle>
            <DialogDescription>
              Link Card UID <span className="font-mono font-semibold text-neutral-900 dark:text-white">{selectedCardToIssue?.nfcUid}</span> to a passenger.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIssueCard}>
            <div className="space-y-4 py-4">
              {/* Search Passenger Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Search Passenger</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={passengerSearch}
                    onChange={(e) => setPassengerSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Passenger List Results */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded-md p-2 divide-y divide-neutral-100 dark:divide-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20">
                {filteredPassengers.length === 0 ? (
                  <div className="text-center py-4 text-xs text-neutral-500">No passengers found</div>
                ) : (
                  filteredPassengers.map((p) => (
                    <label
                      key={p._id}
                      className={`flex items-center justify-between p-2 hover:bg-neutral-100/50 dark:hover:bg-neutral-850/50 cursor-pointer ${selectedPassengerId === p._id ? "bg-neutral-100 dark:bg-neutral-800" : ""
                        }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{p.name}</span>
                        <span className="text-xs text-neutral-500">{p.phoneNumber}</span>
                      </div>
                      <input
                        type="radio"
                        name="selectedPassenger"
                        value={p._id}
                        checked={selectedPassengerId === p._id}
                        onChange={() => setSelectedPassengerId(p._id)}
                        className="h-4 w-4 accent-neutral-900"
                      />
                    </label>
                  ))
                )}
              </div>

              {issueError && (
                <Alert variant="destructive">
                  <AlertDescription>{issueError}</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsIssueOpen(false)
                  setSelectedCardToIssue(null)
                  setSelectedPassengerId("")
                  setPassengerSearch("")
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={issueLoading || !selectedPassengerId}>
                {issueLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Issuing...
                  </>
                ) : (
                  "Confirm & Issue"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sheet: Card Detail */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full px-4 sm:max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800">
          <SheetHeader>
            <SheetTitle>Card Details</SheetTitle>
          </SheetHeader>
          {selectedCardDetail && (
            <div className="space-y-6">
              {/* Card Meta details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">System Information</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm border border-neutral-100 dark:border-neutral-800 p-4 rounded-lg bg-neutral-50/30 dark:bg-neutral-950/20">
                  <div>
                    <span className="block text-xs text-neutral-500">NFC UID</span>
                    <span className="font-mono font-medium text-neutral-900 dark:text-neutral-50">{selectedCardDetail.nfcUid}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-500">Card Status</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50 capitalize">{selectedCardDetail.status}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-500">Balance</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-50">৳{selectedCardDetail.balance.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-neutral-500">Issued Date</span>
                    <span>{selectedCardDetail.issuedAt ? new Date(selectedCardDetail.issuedAt).toLocaleDateString() : "Unissued"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs text-neutral-500">Last Tap-in/out</span>
                    <span>{selectedCardDetail.lastUsedAt ? new Date(selectedCardDetail.lastUsedAt).toLocaleString() : "Never Used"}</span>
                  </div>
                </div>
              </div>

              {/* Linked Passenger info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Linked Passenger</h3>
                {selectedCardDetail.userId ? (
                  <div className="border border-neutral-100 dark:border-neutral-800 p-4 rounded-lg bg-neutral-50/30 dark:bg-neutral-950/20 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Name:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedCardDetail.userId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Phone:</span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedCardDetail.userId.phoneNumber}</span>
                    </div>
                    {selectedCardDetail.userId.email && (
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Email:</span>
                        <span className="font-semibold text-neutral-900 dark:text-neutral-50">{selectedCardDetail.userId.email}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm italic text-neutral-500 bg-neutral-50/50 dark:bg-neutral-950/10 p-4 rounded-lg border border-dashed text-center">
                    No passenger linked to this card.
                  </div>
                )}
              </div>

              {/* Last 5 Trips list */}
              {selectedCardDetail.userId && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-neutral-450 dark:text-neutral-400 uppercase tracking-wider">Last 5 Trips</h3>
                  {tripsLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                      <span className="text-xs text-neutral-500">Loading trip history...</span>
                    </div>
                  ) : recentTrips.length === 0 ? (
                    <div className="text-sm italic text-neutral-500 text-center py-4">
                      No trip history found for this card.
                    </div>
                  ) : (
                    <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden text-xs">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-neutral-50 dark:bg-neutral-900/50">
                            <TableHead className="text-center font-semibold">Date</TableHead>
                            <TableHead className="text-center font-semibold">Route</TableHead>
                            <TableHead className="text-center font-semibold">Fare</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentTrips.map((trip) => (
                            <TableRow key={trip._id}>
                              <TableCell className="text-center py-2.5 text-neutral-550 dark:text-neutral-450">
                                {trip.checkoutTime ? new Date(trip.checkoutTime).toLocaleDateString() : 'null'}
                              </TableCell>

                              <TableCell className="py-2.5">
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                  {trip.routeId?.routeName || '-'}
                                </div>

                              </TableCell>

                              <TableCell className="text-center py-2.5 font-medium">
                                {trip.fareStatus === "deducted" ? `৳${trip.fare}` : <span className="text-red-500 font-normal capitalize">{trip.fareStatus}</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
