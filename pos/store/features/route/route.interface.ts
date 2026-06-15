import { BUS_STATUS, BUS_TYPES, USER_ROLES } from "@/constants";

export interface IRoute {
  _id: string;
  routeNo?: string;
  routeName: string;
  totalDistance?: number;
  estimatedTime?: number;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: USER_ROLES;
  phoneNumber?: string;
  routeId?: IRoute | null;
}

export interface IBus {
  _id: string;
  name: string;
  capacity?: number;
  busType?: BUS_TYPES;
  status?: BUS_STATUS;
  assignedRouteId?: string;
}
