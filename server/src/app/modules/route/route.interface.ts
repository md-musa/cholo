export interface IRoute {
  routeNo: string;
  routeName: string;
  distance?: number;
  travelTime?: number;

  routeLine: [number, number][];

  stopages: {
    name: string;
    coords: [number, number];
  }[];
}
