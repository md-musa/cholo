import type { ReactNode } from "react"

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
        {children}
      </div>
    </div>
  )
}
