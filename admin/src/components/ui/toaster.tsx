import { useState, useCallback } from "react"
import { CheckCircle2, XCircle, X } from "lucide-react"

export type ToastVariant = "success" | "error"

export interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

let _counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++_counter
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}

export function Toaster({
  toasts,
  dismiss,
}: {
  toasts: Toast[]
  dismiss: (id: number) => void
}) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium pointer-events-auto min-w-[280px] max-w-sm ${
            t.variant === "success"
              ? "bg-white dark:bg-neutral-900 border-green-200 dark:border-green-800 text-neutral-800 dark:text-neutral-100"
              : "bg-white dark:bg-neutral-900 border-red-200 dark:border-red-800 text-neutral-800 dark:text-neutral-100"
          }`}
        >
          {t.variant === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-red-500" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="ml-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
