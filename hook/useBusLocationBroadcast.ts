import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { stopBroadcasting } from "@/store/features/broadcast/broadcastSlice";
import { BroadcastBusLocationInBackground } from "@/backgroundTasks/broadcastBusLocation";

export function useBusLocationBroadcast() {
  const dispatch = useAppDispatch();
  const { isBroadcasting, activeTrip } = useAppSelector((state) => state.broadcast);

  useEffect(() => {
    const startBackground = async () => {
      if (isBroadcasting && activeTrip) {
        await BroadcastBusLocationInBackground.start({
          tripId: activeTrip.tripId,
        });
      }
    };

    startBackground();

    return () => {
      stopAllTracking();
    };
  }, [isBroadcasting, activeTrip?.tripId]);

  const stopAllTracking = async () => {
    await BroadcastBusLocationInBackground.stop();
  };

  const stopBusLocationBroadcasting = async () => {
    await stopAllTracking();
    dispatch(stopBroadcasting());
  };

  return {
    stopBusLocationBroadcasting,
    isBackgroundActive: BroadcastBusLocationInBackground.isRunning(),
  };
}
