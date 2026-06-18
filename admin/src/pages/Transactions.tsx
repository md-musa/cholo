import { useState, useEffect, useCallback } from "react"
import { Search, Receipt, ArrowUpDown } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ──────────────────────────────────────────────────────────────────

interface Transaction {
  _id: string
  userId: { name: string; phoneNumber: string } | null
  routeId: { routeNo: string; routeName: string } | null
  busId: { name: string } | null
  startStoppage: string
  endStoppage: string | null
  fare: number | null
  fareStatus: "deducted" | "failed" | "pending"
  checkinTime: string
  checkoutTime: string | null
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fareStatusBadge(status: Transaction["fareStatus"]) {
  switch (status) {
    case "deducted":
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50 hover:bg-emerald-50">
          Deducted
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50 hover:bg-red-50">
          Failed
        </Badge>
      )
    default:
      return (
        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 hover:bg-amber-50">
          Pending
        </Badge>
      )
  }
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// ── Skeleton row ───────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export function Transactions() {
  const [search, setSearch] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  console.log(transactions)
  const fetchTransactions = useCallback(async (phone: string) => {
    setLoading(true)
    setError(null)

    const token = localStorage.getItem("token")
    const params = phone.trim() ? `?search=${encodeURIComponent(phone.trim())}` : ""

    try {
      const res = await fetch(
        `http://localhost:4000/api/v1/trip/transactions${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch transactions")
      }
      setTransactions(result.data || [])
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search input — wait 400 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => fetchTransactions(search), 400)
    return () => clearTimeout(timer)
  }, [search, fetchTransactions])

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Transactions
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Browse the 20 most recent fare transactions. Search by passenger phone number.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Receipt className="h-4 w-4" />
          <span>Latest 20</span>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          id="transaction-search"
          type="text"
          placeholder="Search by phone number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus-visible:ring-1 focus-visible:ring-neutral-400"
        />
      </div>

      {/* ── Table Card ── */}
      <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Fare Transactions</CardTitle>
          <CardDescription>
            {search
              ? `Showing results for "${search}"`
              : "Showing 20 most recent transactions"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>

                <TableRow className="bg-neutral-50 dark:bg-neutral-900/60 hover:bg-neutral-50 dark:hover:bg-neutral-900/60">
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300 pl-6">
                    <span className="flex items-center gap-1">
                      Phone<ArrowUpDown className="h-3 w-3 opacity-50" />
                    </span>
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Passenger
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Route
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300">
                    Traveled Distance
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300 text-right">
                    Fare (৳)
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300 text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-neutral-600 dark:text-neutral-300 pr-6">
                    Date & Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <SkeletonRows />
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-48 text-center text-sm text-red-500"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        <Receipt className="h-8 w-8 opacity-30" />
                        <p className="text-sm font-medium">No transactions found</p>
                        {search && (
                          <p className="text-xs">
                            No results for &ldquo;{search}&rdquo;. Try a different phone number.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow
                      key={tx._id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors"
                    >
                      {/* Passenger phone */}
                      <TableCell className="pl-6 font-mono text-sm text-neutral-700 dark:text-neutral-300">
                        {tx.userId?.phoneNumber || "—"}
                      </TableCell>

                      {/* Passenger name */}
                      <TableCell className="pl-6 font-mono text-sm text-neutral-700 dark:text-neutral-300">
                        {tx.userId?.name || "—"}
                      </TableCell>

                      {/* Start stop */}
                      <TableCell className="text-sm text-neutral-600 dark:text-neutral-400 max-w-[140px] truncate" title={tx.routeId?.routeName || "—"}>
                        {tx.routeId?.routeName || "—"}
                      </TableCell>

                      {/* End stop */}
                      <TableCell className="text-sm text-neutral-600 dark:text-neutral-400 max-w-[140px] truncate" title={tx.distanceInKm ? `${tx.distanceInKm.toFixed(2)} km` : "—"}>
                        {tx.distanceInKm ? `${tx.distanceInKm.toFixed(2)} km` : "—"}
                      </TableCell>

                      {/* Fare */}
                      <TableCell className="text-sm text-right font-medium text-neutral-800 dark:text-neutral-200">
                        {tx.fare !== null ? `৳${tx.fare}` : "—"}
                      </TableCell>

                      {/* Status badge */}
                      <TableCell className="text-center">
                        {fareStatusBadge(tx.fareStatus)}
                      </TableCell>

                      {/* Date & time */}
                      <TableCell className="pr-6 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {formatDateTime(tx.checkoutTime ?? tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
