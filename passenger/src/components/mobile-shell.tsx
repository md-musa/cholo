import type { ReactNode } from "react"

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-[#ede6db] px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-[32px] border border-[#ddd2c3] bg-[#f7f2ea] shadow-[0_24px_80px_rgba(100,83,60,0.14)]">
        {children}
      </div>
    </div>
  )
}
