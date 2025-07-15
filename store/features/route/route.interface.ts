import { STUDENT_DENSITY, USER_ROLES } from "@/constants";

export interface IRoute {
  _id: string;
  routeNo: string;
  routeName: string;
  totalDistance?: number; // in kilometers
  estimatedTime?: number; // in minutes
  wayline?: unknown; // matches Mongoose Mixed
  assignedBuses?: string[]; // array of ObjectIds as strings
  waypoints?: {
    location?: string;
    latitude?: number;
    longitude?: number;
    studentDensity?: STUDENT_DENSITY.LOW | STUDENT_DENSITY.MEDIUM | STUDENT_DENSITY.HIGH;
  }[];
}

export interface IUser {
  name: string;
  email: string;
  role: USER_ROLES.ADMIN | USER_ROLES.EMPLOYEE | USER_ROLES.STUDENT | USER_ROLES.SUPER_ADMIN;
  phoneNumber: string;
  houseLocation: {
    latitude: number;
    longitude: number;
  };
}
