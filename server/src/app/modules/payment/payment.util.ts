import * as turf from "@turf/turf";

export function calculateDistance(checkinCoords: number[], checkoutCoords: number[], routeLine): number {
  const checkinPoint = turf.point(checkinCoords);
  const checkoutPoint = turf.point(checkoutCoords);
  routeLine = turf.lineString(routeLine);

  // Snap points to the route
  const snappedCheckin = turf.nearestPointOnLine(routeLine, checkinPoint);
  const snappedCheckout = turf.nearestPointOnLine(routeLine, checkoutPoint);

  // Calculate distance along the route
  const distance = turf.length(turf.lineSlice(snappedCheckin, snappedCheckout, routeLine), { units: "kilometers" });

  return distance;
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
