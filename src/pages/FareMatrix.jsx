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

      <div className="overflow-auto">
        {stops.length > 0 && (
          <table className="min-w-max w-full table-auto border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left font-semibold"></th>
                {stops.map((stop) => (
                  <th key={stop} className="py-3 px-4 text-center font-semibold">
                    {makeUpperCaseAndRemoveUnderscore(stop)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stops.map((fromStop, rowIndex) => (
                <tr key={fromStop} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-3 px-4 font-medium text-gray-800 sticky left-0 bg-white z-10">
                    {makeUpperCaseAndRemoveUnderscore(fromStop)}
                  </td>
                  {stops.map((toStop, colIndex) => (
                    <td
                      key={toStop}
                      className={`py-3 px-4 text-center ${
                        fromStop === toStop ? "bg-green-100 text-green-700 font-bold" : "text-gray-700"
                      }`}
                    >
                      {fareMatrix[fromStop]?.[toStop] ?? "-"}
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
