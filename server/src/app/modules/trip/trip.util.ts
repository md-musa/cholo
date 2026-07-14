import * as turf from "@turf/turf";
import { RouteModel } from "../route/route.model";
import ApiError from "../../../errors/ApiError";


export function calculateDistance(
  checkinCoords: number[],
  checkoutCoords: number[],
  routeLine: number[][]
): number {
  const line = turf.lineString(routeLine);
  const checkinPoint = turf.point([checkinCoords[0], checkinCoords[1]]);
  const checkoutPoint = turf.point([checkoutCoords[0], checkoutCoords[1]]);

  const snappedCheckin = turf.nearestPointOnLine(line, checkinPoint, { units: "kilometers" });
  const snappedCheckout = turf.nearestPointOnLine(line, checkoutPoint, { units: "kilometers" });

  const checkinLoc: number = snappedCheckin.properties.location ?? 0;
  const checkoutLoc: number = snappedCheckout.properties.location ?? 0;
  const distanceKm = Math.abs(checkoutLoc - checkinLoc);
  return distanceKm;
}

export function findNearestStop(userCoords, routeLine, stopages) {
  const userPoint = turf.point(userCoords);
  routeLine = turf.lineString(routeLine);

  // 1. Snap user to route
  const snapped = turf.nearestPointOnLine(routeLine, userPoint);
  const routeStart = turf.point(routeLine.geometry.coordinates[0]);

  const userDist = turf.length(turf.lineSlice(routeStart, snapped, routeLine), { units: "kilometers" });

  // 2. Calculate each stop's along-route distance
  const stopsWithDist = stopages.map((stopage) => {
    const stopPoint = turf.point(stopage.coords);
    const stopDist = turf.length(turf.lineSlice(routeStart, stopPoint, routeLine), { units: "kilometers" });
    return { ...stopage, stopDist };
  });

  // 3. Find stop with minimum distance difference
  let nearest = null;
  let minDiff = Infinity;

  stopsWithDist.forEach((s) => {
    const diff = Math.abs(userDist - s.stopDist);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = s;
    }
  });

  return nearest;
}

export async function detectNearestStoppage(
  coords: { lat: number; lng: number },
  routeId: string
): Promise<string> {
  const route = await RouteModel.findById(routeId).lean();
  if (!route) {
    throw ApiError.notFound("Route not found");
  }

  const coordsArr = [coords.lng, coords.lat];
  const nearest = findNearestStop(coordsArr, route.routeLine, route.stopages);
  if (!nearest) {
    throw ApiError.notFound("Nearest stoppage could not be detected on route");
  }

  return nearest.name;
}
