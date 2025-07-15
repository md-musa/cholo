import { useState, useEffect } from "react";
import * as Location from "expo-location";
export interface ILocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

const useLocation = () => {
  const [location, setLocation] = useState<ILocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | undefined;

    const startLocationTracking = async () => {
      try {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== "granted") {
          setErrorMsg("Location permission denied");
          return;
        }

        let options: Location.LocationOptions = {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 5,
        };

        locationSubscription = await Location.watchPositionAsync(options, (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            speed: newLocation.coords.speed,
            heading: newLocation.coords.heading,
            timestamp: newLocation.timestamp,
          });
        });
      } catch (error) {
        if (error instanceof Error) {
          setErrorMsg(error.message);
        } else {
          setErrorMsg(String(error));
        }
      }
    };

    startLocationTracking();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  return { location, errorMsg };
};

export default useLocation;
