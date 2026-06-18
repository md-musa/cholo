import { Loader2, X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/status-banner"

type RechargeModalProps = {
  open: boolean
  loading: boolean
  onClose: () => void
  onSubmit: (amount: number) => Promise<void>
}

export function RechargeModal({ open, loading, onClose, onSubmit }: RechargeModalProps) {
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")

  if (!open) {
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid recharge amount.")
      return
    }

    setError("")
    await onSubmit(numericAmount)
      .then(() => {
        setAmount("")
        onClose()
      })
      .catch((nextError: Error) => setError(nextError.message))
  }

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/30 p-4 backdrop-blur-[2px]">
      <div className="w-full rounded-[28px] border border-[#ddd2c3] bg-[#fffdf9] p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recharge Card</h3>
            <p className="text-sm text-slate-500">Simple test recharge without a payment gateway.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-10 items-center justify-center rounded-2xl border border-[#e5ddd1] text-slate-500"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Amount</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="Enter amount"
              className="h-12 w-full rounded-2xl border border-[#ddd2c3] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          {error ? <StatusBanner message={error} /> : null}

          <Button className="h-11 w-full rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Complete Recharge
          </Button>
        </form>
      </div>
    </div>
  )
}
