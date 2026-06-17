import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/Login"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { MainLayout } from "./components/MainLayout"
import { Dashboard } from "./pages/Dashboard"
import { Cards } from "./pages/Cards"
import { Passengers } from "./pages/Passengers"
import { Routes as RoutesPage } from "./pages/Routes"
import { LiveMap } from "./pages/LiveMap"
import { Buses } from "./pages/Buses"
import { POSDevices } from "./pages/POSDevices"

// Simple placeholder page for other sidebar routes
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl p-8 bg-white dark:bg-neutral-900/50">
      <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-250 mb-2">{title} Page</h3>
      <p className="text-sm text-neutral-500 max-w-sm">
        This section is currently under development. Please check back later.
      </p>
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cards" element={<Cards />} />
            <Route path="/passengers" element={<Passengers />} />

            {/* Other Sidebar Routes */}
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/buses" element={<Buses />} />
            <Route path="/pos-devices" element={<POSDevices />} />
            <Route path="/fare-matrix" element={<ComingSoon title="Fare Matrix" />} />
            <Route path="/live-map" element={<LiveMap />} />
            <Route path="/transactions" element={<ComingSoon title="Transactions" />} />
            <Route path="/reports" element={<ComingSoon title="Reports" />} />
            <Route path="/settings" element={<ComingSoon title="Settings" />} />
          </Route>
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
