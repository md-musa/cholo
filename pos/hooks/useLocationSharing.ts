import { useState, useEffect, useRef } from "react";
import { Alert } from "react-native";
import * as Location from "expo-location";
import socket from "@/config/socketIoConfig";
import { SOCKET_EVENTS } from "@/constants";
import { requestForegroundLocationPermission } from "@/utils/payUtil";
import { ToastUtil } from "@/utils/toastUtil";

interface UseLocationSharingProps {
  user: any;
}

export function useLocationSharing({ user }: UseLocationSharingProps) {
  const [isSharingLocation, setIsSharingLocation] = useState(false);
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
    setLastLocationText("Location sharing stopped");
    socket.disconnect();
  };

  const startForegroundLocationSharing = async (routeId: string | null, selectedBus: any) => {
    const userId = user?.userId || user?._id;

    if (!userId || !routeId || !selectedBus) {
      ToastUtil.error("Select route and bus first.");
      return;
    }

    const permissionGranted = await requestForegroundLocationPermission();
    if (!permissionGranted) {
      return;
    }

    try {
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
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (location) => {
          const payload = {
            routeId,
            busId: selectedBus._id,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          };

          if (!socket.connected) {
            console.log("SOCKET NOT CONNECTED, CONNECTING...");
            socket.connect();
          }

          socket.emit(SOCKET_EVENTS.BROADCAST_BUS_LOCATION, payload);

          console.log("LOCATION BROADCASTED:", payload);
          if (mountedRef.current) {
            setLastLocationText(`${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`);
          }
        }
      );

      setIsSharingLocation(true);
      setLastLocationText("Location sharing active");
      ToastUtil.success("Foreground location sharing started.");
    } catch (error: any) {
      ToastUtil.error(error?.message || "Failed to start sharing.");
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
    lastLocationText,
    isStartingTrip: false, // Compatibility legacy check
    stopForegroundLocationSharing,
    startForegroundLocationSharing,
    handleLocationToggle,
  };
}
