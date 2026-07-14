import { useState } from "react"
import {
  useGetBusesQuery,
  useCreateBusMutation,
  useUpdateBusMutation,
  useDeleteBusMutation,
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
import { Loader2, Plus, Pencil, Trash2, Bus as BusIcon } from "lucide-react"

function BusTypeBadge({ type }: { type: string }) {
  const isAC = type === "AC"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
        isAC
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
      }`}
    >
      {isAC ? "AC" : "Non-AC"}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active"
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isActive
          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
          : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  )
}

interface BusForm {
  name: string
  busType: "AC" | "NON_AC" | ""
  capacity: string
  status: "active" | "inactive" | ""
}

const emptyForm: BusForm = { name: "", busType: "", capacity: "", status: "" }

export function Buses() {
  const { data: busesRes, isLoading } = useGetBusesQuery()
  const [createBus, { isLoading: isCreating }] = useCreateBusMutation()
  const [updateBus, { isLoading: isUpdating }] = useUpdateBusMutation()
  const [deleteBus, { isLoading: isDeleting }] = useDeleteBusMutation()

  const buses: Bus[] = busesRes?.data ?? []
  const { toasts, toast, dismiss } = useToast()

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Bus | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Bus | null>(null)
  const [form, setForm] = useState<BusForm>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const openAdd = () => {
    setForm(emptyForm)
    setFormError(null)
    setAddOpen(true)
  }

  const openEdit = (bus: Bus) => {
    setForm({
      name: bus.name,
      busType: bus.busType,
      capacity: bus.capacity ? String(bus.capacity) : "",
      status: bus.status === "maintenance" ? "inactive" : bus.status,
    })
    setFormError(null)
    setEditTarget(bus)
  }

  const buildPayload = () => {
    const p: Record<string, unknown> = {
      name: form.name.trim(),
      busType: form.busType,
    }
    if (form.capacity) p.capacity = parseInt(form.capacity, 10)
    if (form.status) p.status = form.status
    return p
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!form.name.trim()) return setFormError("Name is required")
    if (!form.busType) return setFormError("Bus type is required")
    try {
      await createBus(buildPayload() as Partial<Bus>).unwrap()
      setAddOpen(false)
      toast("Bus added successfully", "success")
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to add bus"
      setFormError(msg)
      toast(msg, "error")
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setFormError(null)
    if (!form.name.trim()) return setFormError("Name is required")
    if (!form.busType) return setFormError("Bus type is required")
    try {
      await updateBus({
        id: editTarget._id,
        data: buildPayload() as Partial<Bus>,
      }).unwrap()
      setEditTarget(null)
      toast("Bus updated successfully", "success")
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Failed to update bus"
      setFormError(msg)
      toast(msg, "error")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteBus(deleteTarget._id).unwrap()
      setDeleteTarget(null)
      toast("Bus deleted", "success")
    } catch (err: unknown) {
      toast(
        (err as { data?: { message?: string } })?.data?.message ??
          "Failed to delete bus",
        "error"
      )
      setDeleteTarget(null)
    }
  }

  const FormFields = (
    <div className="space-y-4 py-2">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Bus Name <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="e.g. dhaka-001"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Bus Type <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.busType}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, busType: v as "AC" | "NON_AC" }))
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Select type…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AC">AC</SelectItem>
            <SelectItem value="NON_AC">Non-AC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Capacity{" "}
          <span className="text-xs font-normal text-neutral-400">
            (optional)
          </span>
        </label>
        <Input
          type="number"
          placeholder="e.g. 45"
          min={1}
          value={form.capacity}
          onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Status{" "}
          <span className="text-xs font-normal text-neutral-400">
            (optional)
          </span>
        </label>
        <Select
          value={form.status || "active"}
          onValueChange={(v) =>
            setForm((f) => ({ ...f, status: v as "active" | "inactive" }))
          }
        >
          <SelectTrigger className="h-9 w-full">
            <SelectValue placeholder="Default: active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 dark:border-red-800 dark:bg-red-950/20">
          {formError}
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Buses
          </h1>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Bus
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-neutral-100 bg-neutral-50/80 hover:bg-transparent dark:border-neutral-800 dark:bg-neutral-950/30">
              <TableHead className="pl-5 font-semibold text-neutral-700 dark:text-neutral-300">
                Name
              </TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">
                Type
              </TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">
                Capacity
              </TableHead>
              <TableHead className="font-semibold text-neutral-700 dark:text-neutral-300">
                Status
              </TableHead>
              <TableHead className="pr-5 text-right font-semibold text-neutral-700 dark:text-neutral-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-neutral-400" />
                  <span className="text-xs text-neutral-400">
                    Loading buses…
                  </span>
                </TableCell>
              </TableRow>
            ) : buses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-16 text-center">
                  <BusIcon className="mx-auto mb-2 h-8 w-8 text-neutral-200 dark:text-neutral-700" />
                  <p className="text-sm text-neutral-400">
                    No buses registered yet.
                  </p>
                  <p className="mt-1 text-xs text-neutral-300 dark:text-neutral-600">
                    Click "Add Bus" to get started.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              buses.map((bus) => (
                <TableRow
                  key={bus._id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 dark:border-neutral-800/60 dark:hover:bg-neutral-800/40"
                >
                  <TableCell className="pl-5 font-medium text-neutral-900 capitalize dark:text-neutral-100">
                    {bus.name}
                  </TableCell>
                  <TableCell>
                    <BusTypeBadge type={bus.busType} />
                  </TableCell>
                  <TableCell className="text-neutral-500 dark:text-neutral-400">
                    {bus.capacity ?? (
                      <span className="text-xs text-neutral-300 italic dark:text-neutral-600">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={bus.status} />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(bus)}
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(bus)}
                        className="h-8 w-8 p-0 text-neutral-400 hover:text-red-600 dark:hover:text-red-400"
                      >
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Bus</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            {FormFields}
            <DialogFooter className="mt-2">
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full sm:w-auto"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding…
                  </>
                ) : (
                  "Add Bus"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onOpenChange={(o: boolean) => !o && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
            <DialogDescription>Update the bus details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            {FormFields}
            <DialogFooter className="mt-2">
              <Button
                type="submit"
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o: boolean) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bus</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-700 capitalize dark:text-neutral-200">
                {deleteTarget?.name}
              </span>
              ? This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster toasts={toasts} dismiss={dismiss} />
    </div>
  )
}

export default Buses
