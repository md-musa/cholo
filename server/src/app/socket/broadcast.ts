import { SOCKET_EVENTS } from "../../constants";
import { io } from "../../server";

export const broadcastLocation = async (data: any) => {
  const { routeId, busId, latitude, longitude, speed, heading, timestamp } = data;

  try {
    const res = {
      routeId,
      busId,
      latitude,
      longitude,
      speed,
      heading,
      timestamp: timestamp || new Date().toISOString(),
    };

    io.emit(SOCKET_EVENTS.BUS_LOCATION_UPDATE, res);

    console.log(`📡 Broadcasted location for bus ${busId} on routeId ${routeId}`);
  } catch (error) {
    console.error("❌ Error broadcasting location:", error);
  }
};
