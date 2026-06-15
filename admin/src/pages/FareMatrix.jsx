import React, { useEffect, useState } from "react";
import apiClient from "../config/axiosConfig";
import { makeUpperCaseAndRemoveUnderscore } from "../utils/textUtil";

function FareMatrix() {
  const [currentRoute, setCurrentRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [fareMatrix, setFareMatrix] = useState({});

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const { data } = await apiClient.get("/routes");
        console.log(data);
        setRoutes(data);
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    }
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (!currentRoute) return;
    async function fetchFareMatrix() {
      try {
        const { data } = await apiClient.get(`/fare-matrices`, {
          params: { routeId: currentRoute._id },
        });
        setFareMatrix(data.fareMatrix);
        console.log("Fare Matrix:", data);
      } catch (error) {
        console.error("Failed to fetch fare matrix:", error);
      }
    }
    fetchFareMatrix();
  }, [currentRoute]);
  const stops = Object.keys(fareMatrix);

  return (
    <div>
      <div className="flex justify-center items-center p-2 text-black">
        <select
          className="p-2 border rounded"
          onChange={(e) => {
            const selectedRoute = routes.find((route) => route._id === e.target.value);
            setCurrentRoute(selectedRoute);
          }}
          value={currentRoute?._id || ""}
        >
          <option value="" disabled>
            Select a route
          </option>
          {routes?.map((route) => (
            <option className="text-black" key={route._id} value={route._id}>
              {route.routeName}
            </option>
          ))}
        </select>
      </div>
<div className="overflow-auto max-h-[80vh] rounded-lg border border-gray-200 shadow-sm">
  {stops.length > 0 && (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-100">
        <tr>
          <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20 border-r border-gray-200">
            From \ To
          </th>
          {stops.map((stop, index) => (
            <th
              key={stop}
              className={`py-4 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider ${
                index % 2 === 0 ? 'bg-blue-50' : 'bg-purple-50'
              }`}
            >
              <span className="inline-block whitespace-nowrap">
                {makeUpperCaseAndRemoveUnderscore(stop)}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {stops.map((fromStop, rowIndex) => (
          <tr 
            key={fromStop} 
            className={`transition-colors ${
              rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            <td 
              className={`py-4 px-6 uppercase text-sm font-medium text-gray-900 sticky left-0 z-10 whitespace-nowrap border-r border-gray-200 ${
                rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              {makeUpperCaseAndRemoveUnderscore(fromStop)}
            </td>
            {stops.map((toStop, colIndex) => (
              <td
                key={toStop}
                className={`
                  py-4 px-6 text-center text-sm border border-gray-100
                  ${
                    fromStop === toStop
                      ? "bg-emerald-100 text-emerald-800 font-bold"
                      : rowIndex === colIndex
                      ? "bg-blue-100"
                      : rowIndex % 2 === 0 
                        ? "bg-white" 
                        : "bg-gray-50"
                  }
                  ${rowIndex < colIndex ? "font-medium text-gray-700" : "text-gray-600"}
                  hover:bg-gray-200 transition-colors
                `}
              >
                {fromStop === toStop ? (
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-emerald-200 text-emerald-800 mx-auto">
                    0
                  </span>
                ) : (
                  fareMatrix[fromStop]?.[toStop] ?? "-"
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
    </div>
  );
}

export default FareMatrix;
