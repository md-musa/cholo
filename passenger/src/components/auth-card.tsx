import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/status-banner"

type AuthMode = "login" | "register"

type AuthCardProps = {
  loading: boolean
  onSubmit: (payload: { name?: string; phoneNumber: string; pin: string; mode: AuthMode }) => Promise<void>
}

export function AuthCard({ loading, onSubmit }: AuthCardProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (mode === "register" && !name.trim()) {
      setError("Name is required.")
      return
    }

    if (!phoneNumber.trim() || !pin.trim()) {
      setError("Phone number and PIN are required.")
      return
    }

    setError("")
    await onSubmit({
      mode,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      pin: pin.trim(),
    }).catch((nextError: Error) => {
      setError(nextError.message)
    })
  }

  return (
    <div className="rounded-[28px] border border-[#e2d8cb] bg-[#fffdf9] p-6 shadow-sm">
      <div className="mb-6 flex rounded-2xl bg-[#f3ede4] p-1">
        {(["login", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item)
              setError("")
            }}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold capitalize transition ${
              mode === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Passenger App</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in with your phone number and PIN to view balance, recharge your linked card, and track live buses.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <Field label="Name" value={name} onChange={setName} placeholder="Your name" />
        ) : null}

        <Field
          label="Phone Number"
          value={phoneNumber}
          onChange={setPhoneNumber}
          placeholder="01XXXXXXXXX"
          inputMode="tel"
        />

        <Field
          label="PIN"
          value={pin}
          onChange={setPin}
          placeholder="6 digit PIN"
          inputMode="numeric"
          maxLength={6}
        />

        {error ? <StatusBanner message={error} /> : null}

        <Button className="h-11 w-full rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {mode === "login" ? "Login" : "Create Account"}
        </Button>
      </form>
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  maxLength?: number
}

function Field({ label, value, onChange, placeholder, inputMode, maxLength }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="h-12 w-full rounded-2xl border border-[#ddd2c3] bg-[#fcfaf6] px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  )
}
