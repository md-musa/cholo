import {
  FaMoneyBillWave,
  FaUsers,
  FaCalendarDay,
  FaCalendarAlt,
  FaCheckCircle,
  FaSignInAlt,
  FaSignOutAlt,
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
        console.log("Summary Data:", data);
        setSummary(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };
    fetchSummary();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Today's Income Card */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-gray-700">Today's Income</h2>
                <p className="text-3xl font-bold text-blue-800">৳{summary?.summary.todaysIncome}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaMoneyBillWaveAlt size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <BsGraphUp className="mr-1" />
              <span>12% increase from yesterday</span>
            </div>
          </div>
        </div>

        {/* This Month Income Card */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-gray-700">This Month Income</h2>
                <p className="text-3xl font-bold text-green-800">৳{summary?.summary.monthlyIncome}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCalendarAlt size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-green-600">
              <BsGraphUp className="mr-1" />
              <span>18% increase from last month</span>
            </div>
          </div>
        </div>

        {/* Today's Users Card */}
        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-gray-700">Total Transaction</h2>
                <p className="text-3xl font-bold text-purple-800">{summary?.summary.totalTransactions}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaCalendarDay size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-purple-600">
              <BsGraphUp className="mr-1" />
              <span>8% increase from yesterday</span>
            </div>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-sm">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="card-title text-gray-700">Total Customer</h2>
                <p className="text-3xl font-bold text-orange-800">{summary?.summary.totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <FaUsers size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm text-orange-600">
              <BsPeopleFill className="mr-1" />
              <span>2 new users this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="card bg-white shadow-md p-4 my-10 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <FaHistory className="mr-2 text-green-500" />
          Recent Transactions
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  <FaHashtag className="inline mr-1" /> Card ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  <TbBusStop className="inline mr-1" /> Start Stop
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  <TbBusStop className="inline mr-1" /> End Stop
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  <FaRoad className="inline mr-1" /> Distance
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  <FaMoneyBillWave className="inline mr-1" /> Fare
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  <FaCheckCircle className="inline mr-1" /> Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary?.lastTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{txn.nfcUid}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{txn.startStopage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                    {txn.endStopage ? txn.endStopage : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                    {txn.distanceInKm ? txn.distanceInKm.toFixed(2) + " Km" : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {txn.fare ? "৳" + txn.fare : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full capitalize
                      ${txn.paymentStatus === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {txn.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
