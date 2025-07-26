import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import apiClient from "../../config/axiosConfig";
import { makeUpperCaseAndRemoveUnderscore } from "../../utils/textUtil";

// Configure leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons
const checkInIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const checkOutIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const busMarker = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [38, 41],
  iconAnchor: [12, 41],
});

const ClickCapture = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onClick([lat, lng]);
    },
  });
  return null;
};

const MapPage = () => {
  const [clickedPosition, setClickedPosition] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [simulatedBusPositions, setSimulatedBusPositions] = useState([]);
  const [currentBusPositionIndex, setCurrentBusPositionIndex] = useState(0);
  const [traveledPath, setTraveledPath] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Consolidated trip state
  const [tripState, setTripState] = useState({
    status: "idle", // "idle", "checked-in", "checked-out"
    checkIn: null,
    checkOut: null,
    fare: null,
    nearestStopage: null,
  });

  const findNearestPointIndex = useCallback((point, routeLine) => {
    if (!routeLine || routeLine.length === 0) return 0;

    let nearestIndex = 0;
    let minDistance = Infinity;

    routeLine.forEach((coord, index) => {
      const distance = L.latLng(point).distanceTo(L.latLng([coord[1], coord[0]]));
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  }, []);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const { data } = await apiClient.get("routes");
        setRoutes(data);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    }
    fetchRoutes();
  }, []);

  // Initialize route and find nearest point
  useEffect(() => {
    if (currentRoute?.routeLine && clickedPosition) {
      const lines = currentRoute.routeLine.map((coord) => [coord[1], coord[0]]);
      setSimulatedBusPositions(lines);

      const nearestIndex = findNearestPointIndex(clickedPosition, currentRoute.routeLine);
      setCurrentBusPositionIndex(nearestIndex);
      setTraveledPath(lines.slice(nearestIndex, nearestIndex + 1));
    }
  }, [currentRoute, clickedPosition, findNearestPointIndex]);

  // Simulate bus movement only during active trip
  useEffect(() => {
    let interval;
    if (simulatedBusPositions.length > 0 && tripState.status === "checked-in") {
      interval = setInterval(() => {
        setCurrentBusPositionIndex((prev) => {
          if (prev < simulatedBusPositions.length - 1) {
            setTraveledPath((prevPath) => [...prevPath, simulatedBusPositions[prev + 1]]);
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [simulatedBusPositions, tripState.status]);

  const handleCheckIn = async () => {
    if (isProcessing || !clickedPosition) return;
    setIsProcessing(true);

    try {
      const response = await apiClient.post("/payments/create-payment", {
        userId: "681de61741a6d062595bc542",
        routeId: currentRoute._id,
        busId: "685c430465f521c175a4ca79",
        scheduleId: "xxxxxx",
        nfcUid: "43d5072217680",
        coords: [clickedPosition[1], clickedPosition[0]],
      });

      setTripState({
        status: "checked-in",
        checkIn: clickedPosition,
        checkOut: null,
        fare: response.data.fare,
        nearestStopage: response.data,
      });
    } catch (err) {
      console.error("Check-in error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  console.error("Trip State:", tripState.nearestStopage);
  const handleCheckOut = async () => {
    if (isProcessing || tripState.status !== "checked-in") return;
    setIsProcessing(true);

    try {
      const currentBusPos = simulatedBusPositions[currentBusPositionIndex];
      const currentCoords = [currentBusPos[1], currentBusPos[0]];

      const response = await apiClient.post("/payments/create-payment", {
        userId: "681de61741a6d062595bc542",
        routeId: currentRoute._id,
        busId: "685c430465f521c175a4ca79",
        scheduleId: "xxxxxx",
        nfcUid: "43d5072217680",
        coords: currentCoords,
      });

      setTripState((prev) => ({
        ...prev,
        status: "checked-out",
        checkOut: currentBusPos,
        fare: response.data.fare,
        nearestStopage: response.data,
      }));
    } catch (err) {
      console.error("Check-out error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetTrip = () => {
    setTripState({
      status: "idle",
      checkIn: null,
      checkOut: null,
      fare: null,
      nearestStopage: null,
    });
    setClickedPosition(null);
    setTraveledPath([]);
  };

  const convertToLatLng = (coord) => [coord[1], coord[0]];

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Control Panel */}
      <div className="bg-white py-2 shadow-md flex flex-col md:flex-row gap-4 items-center">
        <select
          className="p-2 border rounded flex-1 max-w-md cursor-pointer"
          onChange={(e) => {
            const selectedRoute = routes.find((route) => route._id === e.target.value);
            setCurrentRoute(selectedRoute);
            resetTrip();
          }}
          value={currentRoute?._id || ""}
        >
          <option value="" disabled>
            Select a route
          </option>
          {routes?.map((route) => (
            <option key={route._id} value={route._id}>
              {route.routeName}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleCheckIn}
            disabled={!clickedPosition || tripState.status !== "idle" || isProcessing}
            className={`px-4 py-2 rounded cursor-pointer ${
              !clickedPosition || tripState.status !== "idle" || isProcessing
                ? "bg-gray-300"
                : "bg-green-500 text-white"
            }`}
          >
            {isProcessing && tripState.status === "idle" ? "Processing..." : "Simulate Check-In"}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={tripState.status !== "checked-in" || isProcessing}
            className={`px-4 py-2 rounded cursor-pointer ${
              tripState.status !== "checked-in" || isProcessing ? "bg-gray-300" : "bg-red-500 text-white"
            }`}
          >
            {isProcessing && tripState.status === "checked-in" ? "Processing..." : "Simulate Check-Out"}
          </button>
          <button
            onClick={resetTrip}
            className="px-4 py-2 rounded bg-blue-500 text-white cursor-pointer"
            disabled={tripState.status === "idle"}
          >
            Reset
          </button>
        </div>

        {/* {tripState.fare !== null && ( */}
        <div className="ml-auto bg-yellow-100 px-4 py-1 rounded">
          {/* Start stopage and endstpage from tripState */}
          <span className="font-bold"></span> {tripState?.nearestStopage?.startStopage} -{" "}
          {tripState?.nearestStopage?.endStopage} <br />
          <span className="font-bold">Fare:</span> ৳{tripState.fare}
        </div>
        {/* )} */}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer center={[23.80497844151923, 90.3623591658772]} zoom={13} style={{ height: "90%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Full Route Line */}
          {currentRoute?.routeLine && (
            <Polyline positions={currentRoute.routeLine.map(convertToLatLng)} color="blue" weight={3} opacity={0.8} />
          )}

          {/* Traveled Path */}
          {traveledPath.length > 0 && <Polyline positions={traveledPath} color="red" weight={5} opacity={0.8} />}

          {/* Bus Stops */}
          {currentRoute?.stopages?.map((stop, idx) => (
            <Marker key={idx} position={convertToLatLng(stop.coords)}>
              <Tooltip permanent direction="top" offset={[0, -5]}>
                <p>🚏 {makeUpperCaseAndRemoveUnderscore(stop.name)}</p>
              </Tooltip>
            </Marker>
          ))}

          {/* Simulated Bus */}
          {tripState.status === "checked-in" && simulatedBusPositions.length > 0 && (
            <Marker position={simulatedBusPositions[currentBusPositionIndex]} icon={busMarker}></Marker>
          )}

          {/* Check-In Marker */}
          {tripState.checkIn && (
            <Marker position={tripState.checkIn} icon={checkInIcon}>
              <Popup>Check-In Point</Popup>
            </Marker>
          )}

          {/* Check-Out Marker */}
          {tripState.checkOut && (
            <Marker position={tripState.checkOut} icon={checkOutIcon}>
              <Popup>Check-Out Point</Popup>
            </Marker>
          )}

          {/* Clicked Position */}
          {clickedPosition && tripState.status === "idle" && (
            <Marker position={clickedPosition}>
              <Tooltip permanent direction="top" offset={[0, -5]}>
                <p>🟢 Clicked Position</p>
              </Tooltip>
            </Marker>
          )}

          <ClickCapture onClick={setClickedPosition} />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;
