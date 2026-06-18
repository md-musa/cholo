import { LogOut, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CardInfo, PassengerUser } from "@/types"

type ProfileCardProps = {
  user: PassengerUser
  card: CardInfo | null
  onRecharge: () => void
  onLogout: () => void
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export function ProfileCard({ user, card, onRecharge, onLogout }: ProfileCardProps) {
  return (
    <div className="rounded-[28px] border border-[#e2d8cb] bg-[#fffdf9] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-3xl bg-emerald-500 text-lg font-semibold text-white">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Account</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.phoneNumber}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex size-10 items-center justify-center rounded-2xl border border-[#e5ddd1] bg-white text-slate-500 transition hover:text-slate-900"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      <div className="mt-5 rounded-[24px] bg-[#f5efe6] p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Wallet className="size-4" />
          Linked Card Balance
        </div>
        <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          {card ? `${card.balance.toFixed(2)} BDT` : "--"}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {card ? `Card status: ${card.status}` : "No linked card found for this account."}
        </p>
      </div>

      <Button
        onClick={onRecharge}
        disabled={!card}
        className="mt-4 h-11 w-full rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-slate-300"
      >
        Recharge
      </Button>
    </div>
  )
}
