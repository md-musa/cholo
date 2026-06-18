type StatusBannerProps = {
  message: string
  tone?: "error" | "success"
}

export function StatusBanner({ message, tone = "error" }: StatusBannerProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {message}
    </div>
  )
}
