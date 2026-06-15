import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyBill,
  FaUsers,
  FaTimes
} from "react-icons/fa";
import { LuWaypoints } from "react-icons/lu";

function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: <FaTachometerAlt /> },
    { label: "FareMatrix", to: "/fare-matrix", icon: <FaMoneyBill /> },
    { label: "Customers", to: "/customers", icon: <FaUsers /> },
    { label: "Map", to: "/map", icon: <LuWaypoints /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 h-screen transition-all duration-300">
      <div className="flex items-center justify-center p-6 border-b border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
          Cholo <span className="text-primary-500">Admin</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-slate-200">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                    active
                      ? "bg-primary-50 text-primary-600 font-semibold shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                  }`}
                >
                  <span className={`text-xl ${active ? "text-primary-500" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  <span className="text-[15px]">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-center shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-2">Need help?</p>
          <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">Contact Support</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
