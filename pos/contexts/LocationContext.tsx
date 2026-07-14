import React, { createContext, useContext } from "react";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { useAppSelector } from "@/store/storeConfig";

interface LocationSharingContextType {
  isSharingLocation: boolean;
  lastLocationText: string;
  stopForegroundLocationSharing: () => void;
  startForegroundLocationSharing: (routeId: string | null, selectedBus: any) => Promise<void>;
  handleLocationToggle: (routeId: string | null, selectedBus: any) => Promise<void>;
}

const LocationSharingContext = createContext<LocationSharingContextType | undefined>(undefined);

export function LocationSharingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  //console.log("✅ userid in locationContex: ", user);
  const locationSharing = useLocationSharing({ user });

  return <LocationSharingContext.Provider value={locationSharing}>{children}</LocationSharingContext.Provider>;
}

export function useLocationSharingContext() {
  const context = useContext(LocationSharingContext);
  if (!context) {
    throw new Error("useLocationSharingContext must be used within a LocationSharingProvider");
  }
  return context;
}
