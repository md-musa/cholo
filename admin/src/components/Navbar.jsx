import React from "react";
import { FaUserCircle, FaBars } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { userData, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        <div className="flex items-center">
          {/* Mobile menu button (we might implement drawer toggle later if needed) */}
          <button className="lg:hidden text-slate-500 hover:text-primary-600 focus:outline-none p-2 mr-2">
            <FaBars className="h-6 w-6" />
          </button>
          
          <div className="lg:hidden text-xl font-bold text-slate-800 tracking-tight">
            Cholo <span className="text-primary-500">Admin</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {userData && (
            <div className="hidden sm:flex flex-col text-right mr-2">
              <span className="text-sm font-semibold text-slate-800">{userData.name}</span>
              <span className="text-xs text-slate-500 capitalize">{userData.role}</span>
            </div>
          )}
          
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-slate-200 hover:border-primary-300 transition-colors p-1">
              <div className="w-10 rounded-full bg-slate-100 flex items-center justify-center">
                {userData ? <span className="text-lg font-bold text-slate-600">{userData.name.charAt(0)}</span> : <FaUserCircle className="text-2xl text-slate-400" />}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-4 z-[1] p-2 shadow-xl shadow-slate-200/50 menu menu-sm dropdown-content bg-white border border-slate-100 text-slate-700 rounded-2xl w-56"
            >
              <div className="px-4 py-3 border-b border-slate-100 mb-2 sm:hidden">
                <p className="text-sm text-slate-900 font-medium truncate">{userData?.name}</p>
                <p className="text-xs text-slate-500 truncate">{userData?.email}</p>
              </div>
              <li>
                <a className="hover:bg-slate-50 rounded-xl py-2.5">
                  <span className="font-medium">Profile</span>
                </a>
              </li>
              <li>
                <a className="hover:bg-slate-50 rounded-xl py-2.5">
                  <span className="font-medium">Settings</span>
                </a>
              </li>
              <div className="divider my-1"></div>
              <li onClick={logout}>
                <a className="hover:bg-red-50 hover:text-red-600 rounded-xl py-2.5 text-red-500">
                  <span className="font-medium">Logout</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
