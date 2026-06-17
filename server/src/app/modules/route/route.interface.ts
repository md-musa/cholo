export interface IRoute {
  routeNo: string; // required
  routeName: string; // required
  distance?: number; // optional, in km
  travelTime?: number; // optional, in minutes

  routeLine: [number, number][]; // optional, [lng, lat]

  stopages: {
    name: string;
    coords: [number, number]; // [lng, lat]
  }[];
}
