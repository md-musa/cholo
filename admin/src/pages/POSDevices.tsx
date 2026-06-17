import { useState } from "react"
import {
  useGetPOSDevicesQuery,
  useCreatePOSDeviceMutation,
  useUpdatePOSDeviceMutation,
  useDeletePOSDeviceMutation,
  useGetBusesQuery,
  type POSDevice,
  type Bus,
} from "@/store/apiSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useToast, Toaster } from "@/components/ui/toaster"
import { Loader2, Plus, Pencil, Trash2, Smartphone, Eye, EyeOff } from "lucide-react"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  const isActive = status === "active"
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      isActive
        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
        : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  )
}

function resolveAssignedBus(device: POSDevice, buses: Bus[]): string {
  if (!device.assignedBus) return "—"
  if (typeof device.assignedBus === "object" && device.assignedBus.name) {
    return device.assignedBus.name
  }
  const id = typeof device.assignedBus === "string" ? device.assignedBus : device.assignedBus._id
  return buses.find((b) => b._id === id)?.name ?? "Unassigned"
}

// ─── Form state ───────────────────────────────────────────────────────────────
interface POSForm {
  name: string
  phoneNumber: string
  pin: string
  assignedBus: string
  status: "active" | "inactive" | ""
}

const emptyForm: POSForm = { name: "", phoneNumber: "", pin: "", assignedBus: "", status: "" }

// ─── Page ─────────────────────────────────────────────────────────────────────
export function POSDevices() {
  const { data: devicesRes, isLoading } = useGetPOSDevicesQuery()
  const { data: busesRes } = useGetBusesQuery()
  const [createDevice, { isLoading: isCreating }] = useCreatePOSDeviceMutation()
  const [updateDevice, { isLoading: isUpdating }] = useUpdatePOSDeviceMutation()
  const [deleteDevice, { isLoading: isDeleting }] = useDeletePOSDeviceMutation()

  const devices: POSDevice[] = devicesRes?.data ?? []
  const buses: Bus[] = busesRes?.data ?? []
  const { toasts, toast, dismiss } = useToast()

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<POSDevice | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<POSDevice | null>(null)
  const [form, setForm] = useState<POSForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPin, setShowPin] = useState(false)

  const isEdit = !!editTarget

  const openAdd = () => {
    setForm(emptyForm)
    setFormError(null)
    setShowPin(false)
    setAddOpen(true)
  }

  const openEdit = (device: POSDevice) => {
    const busId =
      typeof device.assignedBus === "object" && device.assignedBus
        ? device.assignedBus._id
        : (device.assignedBus as string) ?? ""
    setForm({
      name: device.name ?? "",
      phoneNumber: device.phoneNumber,
      pin: "",
      assignedBus: busId,
      status: device.status ?? "",
    })
    setFormError(null)
    setShowPin(false)
    setEditTarget(device)
  }

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Device name is required"
    if (!form.phoneNumber.trim()) return "Phone number is required"
    if (!isEdit && !form.pin) return "PIN is required"
    if (form.pin) {
      if (form.pin.length < 4 || form.pin.length > 6) return "PIN must be 4–6 digits"
      if (!/^\d+$/.test(form.pin)) return "PIN must contain only digits"
    }
    return null
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateForm()
    if (err) { setFormError(err); return }
    setFormError(null)

    const payload: Record<string, unknown> = {
      phoneNumber: form.phoneNumber.trim(),
      pin: form.pin,
      name: form.name.trim(),
      status: form.status || "active",
    }
    if (form.assignedBus) payload.assignedBus = form.assignedBus

    try {
      await createDevice(payload as Parameters<typeof createDevice>[0]).unwrap()
      setAddOpen(false)
      toast("POS device added successfully", "success")
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to add device"
      setFormError(msg)
      toast(msg, "error")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    const err = validateForm()
    if (err) { setFormError(err); return }
    setFormError(null)

    const payload: Record<string, unknown> = {
      phoneNumber: form.phoneNumber.trim(),
      name: form.name.trim(),
    }
    if (form.pin) payload.pin = form.pin
    if (form.assignedBus) payload.assignedBus = form.assignedBus
    if (form.status) payload.status = form.status

    try {
      await updateDevice({ id: editTarget._id, data: payload as Parameters<typeof updateDevice>[0]["data"] }).unwrap()
      setEditTarget(null)
      toast("Device updated successfully", "success")
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? "Failed to update device"
      setFormError(msg)
      toast(msg, "error")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteDevice(deleteTarget._id).unwrap()
      setDeleteTarget(null)
      toast("Device deleted", "success")
    } catch (err: unknown) {
      toast((err as { data?: { message?: string } })?.data?.message ?? "Failed to delete", "error")
      setDeleteTarget(null)
    }
  }

  const FormFields = (
    <div className="space-y-4 py-2">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Device Name <span className="text-red-500">*</span>
        </label>
        <Input placeholder="e.g. POS-01" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="h-9" />
      </div>

      {/* Phone */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <Input placeholder="e.g. 01700000000" value={form.phoneNumber}
          onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} className="h-9" />
      </div>

      {/* PIN */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          PIN{" "}
          {isEdit
            ? <span className="text-xs font-normal text-neutral-400">(leave blank to keep unchanged)</span>
            : <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            maxLength={6}
            placeholder={isEdit ? "Enter new PIN to change" : "4–6 digit PIN"}
            value={form.pin}
            onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "") }))}
            className="h-9 pr-10 font-mono tracking-widest"
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShowPin((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
            {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Assigned Bus */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Assign to Bus <span className="text-xs font-normal text-neutral-400">(optional)</span>
        </label>
        <Select value={form.assignedBus || "none"}
          onValueChange={(v) => setForm((f) => ({ ...f, assignedBus: v === "none" ? "" : v }))}>
          <SelectTrigger className="w-full h-9"><SelectValue placeholder="Unassigned" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {buses.map((bus) => (
              <SelectItem key={bus._id} value={bus._id}>
                <span className="capitalize">{bus.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Status <span className="text-xs font-normal text-neutral-400">(optional)</span>
        </label>
        <Select value={form.status || "active"}
          onValueChange={(v) => setForm((f) => ({ ...f, status: v as "active" | "inactive" }))}>
          <SelectTrigger className="w-full h-9"><SelectValue placeholder="Default: active" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formError && (
        <p className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
          {formError}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">POS Devices</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage conductor POS devices and their bus assignments.
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Device
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/30">
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300 pl-5">Name</TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Phone</TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Assigned Bus</TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">Status</TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400 mx-auto mb-2" />
                <span className="text-xs text-neutral-400">Loading devices…</span>
              </TableCell></TableRow>
            ) : devices.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-16">
                <Smartphone className="h-8 w-8 text-neutral-200 dark:text-neutral-700 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">No POS devices registered yet.</p>
                <p className="text-xs text-neutral-300 dark:text-neutral-600 mt-1">Click "Add Device" to get started.</p>
              </TableCell></TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device._id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
                  <TableCell className="pl-5 font-medium text-neutral-900 dark:text-neutral-100">
                    {device.name ?? <span className="text-neutral-400 italic text-xs">unnamed</span>}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-neutral-600 dark:text-neutral-300">
                    {device.phoneNumber}
                  </TableCell>
                  <TableCell className="text-neutral-500 dark:text-neutral-400 capitalize text-sm">
                    {resolveAssignedBus(device, buses)}
                  </TableCell>
                  <TableCell><StatusBadge status={device.status} /></TableCell>
                  <TableCell className="text-right pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(device)}
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(device)}
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 dark:hover:text-red-400">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add POS Device</DialogTitle>
            <DialogDescription>Register a new conductor POS device.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            {FormFields}
            <DialogFooter className="mt-2">
              <Button type="submit" disabled={isCreating} className="w-full sm:w-auto">
                {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding…</> : "Add Device"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o: boolean) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
            <DialogDescription>Update device details. Leave PIN blank to keep it unchanged.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            {FormFields}
            <DialogFooter className="mt-2">
              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete POS Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                {deleteTarget?.name ?? deleteTarget?.phoneNumber}
              </span>?{" "}
              This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Deleting…</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster toasts={toasts} dismiss={dismiss} />
    </div>
  )
}

export default POSDevices
