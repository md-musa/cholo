import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { Circle, Marker, Tooltip } from "react-leaflet";
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const UserLocation = () => {
  const map = useMap();
  const [position, setPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const latlng = [latitude, longitude];
        setPosition(latlng);
        map.setView(latlng, 15); // optionally zoom to user
      },
      (err) => {
        console.error("Geolocation error:", err);
      },
      { enableHighAccuracy: true }
    );
  }, [map]);

  return position ? (
    <>
      <Marker position={position} icon={userIcon}>
        <Tooltip permanent direction="left" offset={[-20, -20]} opacity={1}>
          🧍 You are here
        </Tooltip>
      </Marker>
      <Circle center={position} radius={20} pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.3 }} />
    </>
  ) : null;
};
export default UserLocation;
