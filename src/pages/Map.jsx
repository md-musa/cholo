import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import apiClient from "../config/axiosConfig";
import { makeUpperCaseAndRemoveUnderscore } from "../utils/textUtil";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
  const [nearestStopage, setNearestStopage] = useState(null);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const { data } = await apiClient.get("routes");
        console.log(data);
        setRoutes(data);
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    }
    fetchRoutes();
  }, []);

  useEffect(() => {
    async function nearestStopage() {
      setNearestStopage(null);
      try {
        const { data } = await apiClient.post("/payments/create-payment", {
          user: "xxxxxx",
          route: currentRoute._id,
          bus: "xxxx",
          schedule: "xxxx",
          nfcUid: "xxxx",
          coords: [clickedPosition[1], clickedPosition[0]],
        });
        setNearestStopage(data.data);
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    }
    nearestStopage();
  }, [clickedPosition]);

  console.log(clickedPosition);

  const convertToLatLng = (coord) => [coord[1], coord[0]];

  return (
    <div className="h-screen w-full">
      <div className="flex justify-center items-center p-2 text-black">
        <select
          className="p-2 border rounded"
          onChange={(e) => {
            const selectedRoute = routes.find((route) => route._id === e.target.value);
            setCurrentRoute(selectedRoute);
            setClickedPosition(null);
            setNearestStopage(null);
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

      <div className="p-2 rounded-xl overflow-hidden h-full w-full">
        <MapContainer
          center={[23.80497844151923, 90.3623591658772]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {currentRoute?.routeLine && <Polyline positions={currentRoute.routeLine.map(convertToLatLng)} color="blue" />}

          {currentRoute?.stopages?.map((stop, idx) => (
            <Marker key={idx} position={convertToLatLng(stop.coords)}>
              <Tooltip permanent direction="top" offset={[0, -5]}>
                <p>🚩 {makeUpperCaseAndRemoveUnderscore(stop.name)}</p>
              </Tooltip>
            </Marker>
          ))}

          {clickedPosition && (
            <Marker position={clickedPosition}>
              <Tooltip permanent direction="top" offset={[0, -5]}>
                <p>🟠 {nearestStopage?.stop}</p>
                <p>{"  " + nearestStopage?.fare} Tk</p>
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
