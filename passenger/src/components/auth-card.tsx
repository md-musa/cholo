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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="mb-6 flex rounded-xl bg-slate-200/60 p-1">
        {(["login", "register"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setMode(item)
              setError("")
            }}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold capitalize transition ${
              mode === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black tracking-widest text-slate-900 uppercase">CHOLO</h1>
        <p className="mt-2 text-xs leading-5 text-slate-500">
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

        <Button className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800" disabled={loading}>
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
  const id = `field-${label.toLowerCase().replace(/\s+/g, "-")}`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
      />
    </div>
  )
}
