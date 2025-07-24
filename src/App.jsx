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
    <div className="max-w-[1500px] mx-auto">
      <div className="grid grid-cols-[1fr_4fr]">
        <Sidebar />
        <div className="">
          <Navbar />

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
