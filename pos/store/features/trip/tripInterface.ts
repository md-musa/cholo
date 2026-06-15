import { BUS_TYPES, TRIP_STATUS } from "@/constants";

export interface ITrip {
  routeId: string;
  hostId: string;
  busName: string;
  departureTime?: Date;
  direction?: string;
  status: TRIP_STATUS;
  busType: BUS_TYPES;
  note?: string;
}
