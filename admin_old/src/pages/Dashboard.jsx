import {
  FaMoneyBillWave,
  FaUsers,
  FaCalendarDay,
  FaCalendarAlt,
  FaCheckCircle,
  FaRoad,
  FaHistory,
  FaMoneyBillWaveAlt,
  FaHashtag,
} from "react-icons/fa";
import { BsGraphUp, BsPeopleFill } from "react-icons/bs";
import { useEffect, useState } from "react";
import apiClient from "../config/axiosConfig";
import { TbBusStop } from "react-icons/tb";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await apiClient.get("/payments/dashboard-start");
        setSummary(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Here is the latest summary of your operations.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Income Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
            <FaMoneyBillWaveAlt size={80} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Today's Income</p>
              <h3 className="text-3xl font-bold text-slate-800">৳{summary?.summary.todaysIncome || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <FaMoneyBillWaveAlt size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <BsGraphUp className="mr-1" /> 12%
            </span>
            <span className="ml-2 text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* This Month Income Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
            <FaCalendarAlt size={80} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Monthly Income</p>
              <h3 className="text-3xl font-bold text-slate-800">৳{summary?.summary.monthlyIncome || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <FaCalendarAlt size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <BsGraphUp className="mr-1" /> 18%
            </span>
            <span className="ml-2 text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Total Transaction Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
            <FaCalendarDay size={80} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Transactions</p>
              <h3 className="text-3xl font-bold text-slate-800">{summary?.summary.totalTransactions || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
              <FaCalendarDay size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <BsGraphUp className="mr-1" /> 8%
            </span>
            <span className="ml-2 text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-5 transform group-hover:scale-110 transition-transform">
            <FaUsers size={80} />
          </div>
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Customers</p>
              <h3 className="text-3xl font-bold text-slate-800">{summary?.summary.totalUsers || 0}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <FaUsers size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="flex items-center text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <BsPeopleFill className="mr-1" /> +2
            </span>
            <span className="ml-2 text-slate-400">new this month</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="p-1.5 bg-primary-50 text-primary-500 rounded-lg">
              <FaHistory />
            </span>
            Recent Transactions
          </h2>
          <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center gap-1"><FaHashtag /> Card ID</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center gap-1"><TbBusStop /> Start Stop</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center gap-1"><TbBusStop /> End Stop</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center gap-1"><FaRoad /> Distance</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center gap-1"><FaMoneyBillWave /> Fare</div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <div className="flex items-center gap-1"><FaCheckCircle /> Status</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.lastTransactions?.length > 0 ? (
                summary.lastTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{txn.nfcUid}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">{txn.startStopage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                      {txn.endStopage ? txn.endStopage : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                      {txn.distanceInKm ? txn.distanceInKm.toFixed(2) + " Km" : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                      {txn.fare ? "৳" + txn.fare : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-full capitalize
                        ${txn.paymentStatus === "success" 
                          ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20" 
                          : "bg-rose-50 text-rose-600 ring-1 ring-rose-500/20"}`}
                      >
                        {txn.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">
                    No recent transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
