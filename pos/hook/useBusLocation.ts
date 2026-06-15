// src/hooks/useBusLocation.ts
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import socket from "@/config/socketIoConfig";
import { SOCKET_EVENTS } from "@/constants";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { clearBuses, removeInactiveBuses, updateBusLocation } from "@/store/features/busLocation/busLocationSlice";

export const useBusLocation = () => {
  const dispatch = useAppDispatch();
  const { route } = useAppSelector((state) => state.auth);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // 1. Listen for network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      const isOffline = !state.isConnected || !state.isInternetReachable;
      //console.log("📶");
      setIsDisconnected(isOffline);

      if (isOffline) {
        setMessage("You are offline");
        //console.warn("📴 Internet disconnected");
      } else {
        if (!socket.connected) socket.connect();
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Clean up inactive buses every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(removeInactiveBuses());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // 3. Manage socket connection
  useEffect(() => {
    dispatch(clearBuses());

    const handleLocationUpdate = (data: any) => {
      dispatch(updateBusLocation(data));
      setIsDisconnected(false);
    };

    const handleDisconnect = () => {
      // console.warn("🚫 Socket disconnected");
      setIsDisconnected(true);
      // setMessage("Disconnected from server");
    };

    const handleConnect = () => {
      setIsDisconnected(false);

      if (route) {
        socket.emit(SOCKET_EVENTS.JOIN_ROUTE, route._id);
        //console.log(`✅ Joined room: ${route._id}`);
      }
    };

    const handleConnectError = (error: any) => {
      // console.error("⚠️ Socket connect error:", error?.message);
      setIsDisconnected(true);
      // setMessage("Disconnected from server");
    };

    // Attach socket listeners
    socket.on(SOCKET_EVENTS.BUS_LOCATION_UPDATE, handleLocationUpdate);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Join route room if already connected
    if (socket.connected && route) {
      socket.emit(SOCKET_EVENTS.JOIN_ROUTE, route._id);
    }

    return () => {
      socket.off(SOCKET_EVENTS.BUS_LOCATION_UPDATE, handleLocationUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      if (route) {
        socket.emit(SOCKET_EVENTS.LEAVE_ROUTE_ROOM, route._id);
      }
    };
  }, [route?._id]);

  return {
    isUserDisConnected: isDisconnected,
    internetStatus: message,
    clearBuses: () => dispatch(clearBuses()),
  };
};
