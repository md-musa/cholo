import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  CreditCard,
  Users,
  GitMerge,
  Bus,
  Smartphone,
  Map,
  Receipt,
  Settings,
  LogOut
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Live Map", path: "/live-map", icon: Map },
  { label: "Cards", path: "/cards", icon: CreditCard },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Routes", path: "/routes", icon: GitMerge },
  { label: "Passengers", path: "/passengers", icon: Users },
  { label: "Buses", path: "/buses", icon: Bus },
  { label: "POS Devices", path: "/pos-devices", icon: Smartphone },
  { label: "Settings", path: "/settings", icon: Settings },
]

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const adminName = localStorage.getItem("admin_name") || "Admin User"
  const adminRole = localStorage.getItem("admin_role") || "ADMIN"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("admin_name")
    localStorage.removeItem("admin_role")
    localStorage.removeItem("admin_email")
    navigate("/login", { replace: true })
  }

  // Get current page title
  const currentItem = navItems.find((item) => item.path === location.pathname)
  const pageTitle = currentItem ? currentItem.label : "Admin Panel"

  // Helper for name initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex h-16 items-center px-6 border-b border-neutral-200 dark:border-neutral-800">
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
            Cholo Admin
          </span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-50"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col pl-64 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
          {/* Page Title */}
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
            {pageTitle}
          </h2>

          {/* Admin Profile */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 p-0 text-neutral-850 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700">
                  <span className="font-semibold text-sm">
                    {getInitials(adminName)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{adminName}</p>
                    <p className="text-xs leading-none text-neutral-500 dark:text-neutral-400 capitalize">
                      {adminRole.toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 dark:focus:text-red-400 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content — full-height no-padding for live-map, scrollable for others */}
        <main
          className={`flex-1 overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/50 ${location.pathname === "/live-map"
            ? "flex flex-col p-6"
            : "overflow-y-auto p-8"
            }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
