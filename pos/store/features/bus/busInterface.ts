import { BUS_STATUS, BUS_TYPES } from "@/constants";

export interface IBus {
  _id: string;
  name: string;
  capacity: number;
  busType: BUS_TYPES; 
  status: BUS_STATUS;
  assignedRouteId?: string; 
  assignedDriverId?: string;
}
