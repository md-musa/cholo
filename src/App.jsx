import { Routes, Route } from "react-router-dom";
import RoutePage from "./pages/FareMatrix";
import Schedule from "./pages/AddSchedule";
import Dashboard from "./pages/Dashboard";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import BusPage from "./pages/BusPage";
import AddSchedule from "./pages/AddSchedule";
import Logs from "./pages/Logs";
import FareMatrix from "./pages/FareMatrix";
import Customers from "./pages/Customers";
import MapPage from "./pages/Map/MapPage";

const DashboardLayout = () => {
  return (
    <div className="flex bg-slate-50 min-h-screen">
      {/* Sidebar - fixed or static depending on implementation */}
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fare-matrix" element={<FareMatrix />} />
              <Route path="/add-schedule" element={<AddSchedule />} />
              <Route path="/bus" element={<BusPage />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;
