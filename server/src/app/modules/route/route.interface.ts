import { STUDENT_DENSITY } from "../../../constants";

export interface IRoute {
  routeNo: string; // required
  routeName: string; // required
  distance?: number; // optional, in km
  travelTime?: number; // optional, in minutes

  routeLine: [number, number][]; // optional, [lat, lng]

  stopages: {
    name: string;
    fare: number;
    coords: [number, number]; // optional
  }[];

  assignedBuses?: string[]; // optional

  waypoints?: {
    name?: string;
    coords?: [number, number];
    studentDensity?: STUDENT_DENSITY;
  }[];
}
