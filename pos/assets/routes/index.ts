import { min } from "moment";
import { baipail } from "./routesAndWaypoints/baipail";
import { dhamrai } from "./routesAndWaypoints/dhamrai";
import { dhanmondi } from "./routesAndWaypoints/dhanmondi";
import { ecb } from "./routesAndWaypoints/ecb";
import { konabariPukurPar } from "./routesAndWaypoints/konabariPukurPar";
import { mirpur1 } from "./routesAndWaypoints/mirpur1";
import { savar } from "./routesAndWaypoints/savar";
import { tongiCollegeGate } from "./routesAndWaypoints/tongiCollegeGate";
import { uttara } from "./routesAndWaypoints/uttara";

type RouteKey = "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7" | "R8" | "R9" | "R10" | "R11" | "R12";

const routes = {
  R1: dhanmondi,
  R2: uttara,
  R3: tongiCollegeGate,
  R4: ecb,
  R5: konabariPukurPar,
  R6: baipail,
  R7: dhamrai,
  R8: savar,
  R9: dhanmondi,
  R10: uttara,
  R12: mirpur1,
};

export const getWayline = (routeNo: RouteKey) => {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          coordinates: routes[routeNo]?.wayline ?? [],
          type: "LineString",
        },
      },
    ],
  };
};

export const getWaypoints = (routeNo: RouteKey) => {
  return routes[routeNo]?.waypoints ?? [];
};

export const getCurrentRouteCenterCords = (routeNo: RouteKey) => {
  const wayline = routes[routeNo]?.wayline;

  if (!Array.isArray(wayline) || wayline.length === 0) {
    return null;
  }
  const index = Math.floor(wayline.length / 2);
  return wayline[index];
};

const getRouteBoundaries = (routeNo: RouteKey) => {
  const wayline = routes[routeNo]?.wayline;
  if (!Array.isArray(wayline) || wayline.length === 0) {
    return null;
  }
  const firstPoint = wayline[0];
  const lastPoint = wayline[wayline.length - 1];
  return {
    minLongitude: Math.min(firstPoint[0], lastPoint[0]),
    maxLongitude: Math.max(firstPoint[0], lastPoint[0]),
    minLatitude: Math.min(firstPoint[1], lastPoint[1]),
    maxLatitude: Math.max(firstPoint[1], lastPoint[1]),
  };
};

export const RouteAndWaypointsService = {
  getWayline,
  getWaypoints,
  getCurrentRouteCenterCords,
  getRouteBoundaries,
};
