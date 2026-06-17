import { useState, useEffect } from "react"
import { UserCircle2, Plus, Loader2, ShieldCheck, Gauge } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast, Toaster } from "@/components/ui/toaster"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ──────────────────────────────────────────────────────────────────

interface AdminAccount {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ── Main Component ─────────────────────────────────────────────────────────

export function Settings() {
  // LocalStorage values
  const adminName = localStorage.getItem("admin_name") || "Admin"
  const adminEmail = localStorage.getItem("admin_email") || ""
  const adminRole = localStorage.getItem("admin_role") || "admin"

  const isSuperAdmin = adminRole.toLowerCase() === "super_admin"

  // Toast
  const { toasts, toast, dismiss } = useToast()

  // Admin accounts list
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [adminsLoading, setAdminsLoading] = useState(false)

  // Add admin dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // ── Fare Config state ──
  const [ratePerKm, setRatePerKm] = useState<number | "">("")  // current saved value
  const [rateInput, setRateInput] = useState<string>("")        // controlled input
  const [fareLoading, setFareLoading] = useState(true)
  const [fareSaving, setFareSaving] = useState(false)

  // ── Fetch admin accounts ──
  const fetchAdmins = async () => {
    if (!isSuperAdmin) return
    setAdminsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:4000/api/v1/auth/users?role=admin", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setAdmins(result.data || [])
      }
    } catch {
      // silently fail — list just won't show
    } finally {
      setAdminsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
    fetchFareConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch fare config ──
  const fetchFareConfig = async () => {
    setFareLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:4000/api/v1/fare-config", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      if (res.ok && result.success) {
        setRatePerKm(result.data.ratePerKm)
        setRateInput(String(result.data.ratePerKm))
      }
    } catch {
      // silently fail
    } finally {
      setFareLoading(false)
    }
  }

  // ── Save fare config ──
  const handleSaveFare = async () => {
    const parsed = parseFloat(rateInput)
    if (isNaN(parsed) || parsed <= 0) {
      toast("Rate must be a positive number", "error")
      return
    }
    setFareSaving(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:4000/api/v1/fare-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ratePerKm: parsed }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.message || "Failed to update")
      setRatePerKm(result.data.ratePerKm)
      setRateInput(String(result.data.ratePerKm))
      toast("Fare rate updated successfully", "success")
    } catch (err: any) {
      toast(err.message || "Failed to update fare rate", "error")
    } finally {
      setFareSaving(false)
    }
  }

  // ── Handle add admin ──
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:4000/api/v1/auth/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: "admin",
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to create admin")
      }

      toast("Admin account created successfully", "success")
      setDialogOpen(false)
      setForm({ name: "", email: "", password: "" })
      fetchAdmins()
    } catch (err: any) {
      setFormError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setForm({ name: "", email: "", password: "" })
      setFormError(null)
    }
    setDialogOpen(open)
  }

  return (
    <>
      <Toaster toasts={toasts} dismiss={dismiss} />

      <div className="max-w-2xl space-y-6">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage your profile and admin accounts.
          </p>
        </div>

        {/* ── Profile Card ── */}
        <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Profile</CardTitle>
            <CardDescription>Your account details. Contact a super admin to make changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {adminName ? (
                  <span className="text-xl font-bold text-neutral-700 dark:text-neutral-200">
                    {getInitials(adminName)}
                  </span>
                ) : (
                  <UserCircle2 className="h-8 w-8 text-neutral-400" />
                )}
              </div>

              {/* Details */}
              <div className="space-y-1 min-w-0">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                  {adminName}
                </p>
                {adminEmail && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {adminEmail}
                  </p>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize">
                  <ShieldCheck className="h-3 w-3" />
                  {adminRole.toLowerCase().replace("_", " ")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Fare Configuration Card ── */}
        <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-neutral-500" />
              <CardTitle className="text-base font-semibold">Fare Configuration</CardTitle>
            </div>
            <CardDescription>
              Set the per-kilometre fare rate charged to passengers on checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fareLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-20" />
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="rate-per-km"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Rate per km (৳)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">৳</span>
                    <Input
                      id="rate-per-km"
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      disabled={fareSaving}
                      className="w-32"
                    />
                    <span className="text-sm text-neutral-400">/km</span>
                  </div>
                </div>
                <Button
                  onClick={handleSaveFare}
                  disabled={fareSaving || rateInput === String(ratePerKm)}
                  size="sm"
                  className="mb-0.5"
                >
                  {fareSaving ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Saving…</>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>

        {/* ── Admin Accounts Card (superadmin only) ── */}
        {isSuperAdmin && (
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Admin Accounts</CardTitle>
                  <CardDescription className="mt-0.5">
                    All registered admin users in the system.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Admin
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {adminsLoading ? (
                <div className="space-y-3 px-6 pb-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : admins.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-sm text-neutral-400">
                  No admin accounts found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {admins.map((admin) => (
                        <tr
                          key={admin._id}
                          className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors"
                        >
                          <td className="px-6 py-3.5 font-medium text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                            {admin.name}
                          </td>
                          <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400 truncate max-w-[200px]">
                            {admin.email}
                          </td>
                          <td className="px-4 py-3.5 capitalize text-neutral-600 dark:text-neutral-400">
                            {admin.role.replace("_", " ")}
                          </td>
                          <td className="px-6 py-3.5 text-right text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                            {formatDate(admin.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Add Admin Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Add Admin Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin}>
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-name"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Full Name
                </label>
                <Input
                  id="admin-name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Email Address
                </label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  disabled={submitting}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Password
                </label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                  disabled={submitting}
                />
              </div>

              {/* Inline error */}
              {formError && (
                <p className="text-xs text-red-500 font-medium">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create Admin"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
