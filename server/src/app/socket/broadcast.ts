import { SOCKET_EVENTS } from "../../constants";
import ApiError from "../../errors/ApiError";
import { io } from "../../server";
import { BusModel } from "../modules/bus/bus.model";
import { TripModel } from "../modules/trip/trip.model";

export const broadcastLocation = async (data: any) => {
  const { tripId, latitude, longitude, heading, speed } = data;

  try {
    const trip = await TripModel.findById(tripId).lean();
    if (!trip) {
      throw new ApiError(404, `❌ Trip with ID ${tripId} not found`);
    }
    const routeId = trip.routeId.toString();
    const currUserCnt = io.sockets.adapter.rooms.get(routeId)?.size || 0;
    const timestamp = new Date().toISOString();

    const res = {
      trip,
      latitude,
      longitude,
      heading,
      speed,
      currUserCnt,
      timestamp,
    };

    io.to(routeId).emit(SOCKET_EVENTS.BUS_LOCATION_UPDATE, res);

    console.log(`📡 Broadcasted bus ${trip.busName} UserCnt: ${currUserCnt}`);
  } catch (error) {
    console.error("❌ Error fetching bus or host data:", error);
  }
};
