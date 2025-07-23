import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import apiClient from "../config/axiosConfig";

// Fix marker icons (required for many setups)
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

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const { data } = await apiClient.get("routes");
        setCurrentRoute(data.data[0]);
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
      <MapContainer center={[23.80497844151923, 90.3623591658772]} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {currentRoute?.routeLine && <Polyline positions={currentRoute.routeLine.map(convertToLatLng)} color="blue" />}

        {currentRoute?.stopages?.map((stop, idx) => (
          <Marker key={idx} position={convertToLatLng(stop.coords)}>
            <Tooltip permanent direction="top" offset={[0, -5]}>
              <p>{stop.name}</p>
              <p>{stop.fare}Tk</p>
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
  );
};

export default MapPage;
