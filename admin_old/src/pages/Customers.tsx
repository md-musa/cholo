import React, { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../config/axiosConfig";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await apiClient.get("/auth/users", { params: { role: "customer" } }); // Your API endpoint
        setCustomers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <div className="p-4">Loading customers...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-semibold">Name</th>
              <th className="py-3 px-4 text-left font-semibold">Email</th>
              <th className="py-3 px-4 text-left font-semibold">Balance</th>
              <th className="py-3 px-4 text-left font-semibold">Discount</th>
              <th className="py-3 px-4 text-left font-semibold">Status</th>
              <th className="py-3 px-4 text-left font-semibold">Card ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{customer.name}</td>
                <td className="py-3 px-4 text-blue-600">{customer.email}</td>
                <td className="py-3 px-4">৳{customer.balance.toFixed(2)}</td>
                <td className="py-3 px-4">
                  {customer.discount ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {customer.discount}% {customer.discountType ? `(${customer.discountType})` : ""}
                    </span>
                  ) : (
                    <span className="text-gray-500">None</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {customer.isBlocked ? (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Blocked</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-sm text-gray-600">{customer.nfcUid || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Customers;
