import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { userData, logout } = useAuth();

  return (
    <div className="drawer ">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-muted-100">
        {/* Navbar */}
        <div className="navbar bg-slate-700 text-black shadow-md px-4">
          <div className="flex-none lg:hidden">
            <label htmlFor="my-drawer-3" className="btn btn-ghost btn-circle text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
          </div>
          <div className="flex-1 text-white text-xl font-semibold">Cholo</div>

          <div className="flex-none">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="">{userData && <FaUserCircle className="text-3xl text-white" />}</div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-white text-black rounded-box w-52"
              >
                <li>
                  <a className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li onClick={logout}>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
          {userData && (
            <div className="flex flex-col mr-4 ml-2 space-y-1">
              <p className="text-sm font-semibold text-white">{userData.name}</p>
              <p className="text-xs capitalize bg-blue-100 text-blue-700 px-2 rounded-md">{userData.role}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
