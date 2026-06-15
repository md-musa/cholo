import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import socket from "@/config/socketIoConfig";
import { BUS_TYPES, SOCKET_EVENTS } from "@/constants";
import { useCreateTripMutation } from "@/store/features/trip/tripApi";
import { requestForegroundLocationPermission } from "@/utils/payUtil";
import { ToastUtil } from "@/utils/toastUtil";

interface UseLocationSharingProps {
  user: any;
}

export function useLocationSharing({ user }: UseLocationSharingProps) {
  const [createTrip, { isLoading: isStartingTrip }] = useCreateTripMutation();
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [lastLocationText, setLastLocationText] = useState("Waiting for GPS");

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = null;
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  const stopForegroundLocationSharing = () => {
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    setIsSharingLocation(false);
    setActiveTripId(null);
    setLastLocationText("Location sharing stopped");
    socket.disconnect();
  };

  const startForegroundLocationSharing = async (routeId: string | null, selectedBus: any) => {
    if (!user?._id || !routeId || !selectedBus) {
      ToastUtil.error("Select route and bus first.");
      return;
    }

    const permissionGranted = await requestForegroundLocationPermission();
    if (!permissionGranted) {
      return;
    }

    try {
      const trip = await createTrip({
        routeId,
        hostId: user._id,
        busName: selectedBus.name,
        busType: selectedBus.busType || BUS_TYPES.STUDENT,
      }).unwrap();

      const tripId = trip?.data?._id ?? trip?._id;

      if (!tripId) {
        throw new Error("Trip ID missing from response.");
      }

      if (!socket.connected) {
        socket.connect();
      }

      socket.off("connect");
      socket.on("connect", () => {
        ToastUtil.success("Socket connected for live tracking.");
      });

      locationSubscriptionRef.current?.remove();
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (location) => {
          const payload = {
            tripId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          };

          if (!socket.connected) {
            socket.connect();
          }

          socket.emit(SOCKET_EVENTS.BROADCAST_BUS_LOCATION, payload);
          if (mountedRef.current) {
            setLastLocationText(`${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`);
          }
        }
      );

      setActiveTripId(tripId);
      setIsSharingLocation(true);
      setLastLocationText("Location sharing active");
      ToastUtil.success("Foreground location sharing started.");
    } catch (error: any) {
      ToastUtil.error(error?.response?.data?.message || error?.data?.message || "Failed to start sharing.");
    }
  };

  const handleLocationToggle = async (routeId: string | null, selectedBus: any) => {
    if (isSharingLocation) {
      Alert.alert("Stop location sharing?", "This bus will no longer broadcast its live location.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: stopForegroundLocationSharing,
        },
      ]);
    } else {
      await startForegroundLocationSharing(routeId, selectedBus);
    }
  };

  return {
    isSharingLocation,
    activeTripId,
    lastLocationText,
    isStartingTrip,
    stopForegroundLocationSharing,
    startForegroundLocationSharing,
    handleLocationToggle,
  };
}
