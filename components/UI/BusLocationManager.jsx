import { useBusLocation } from "@/hook/useBusLocation";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

function BusLocationManager() {
  const { isUserDisConnected, internetStatus } = useBusLocation();
  const [showConnectedMsg, setShowConnectedMsg] = useState(false);

  useEffect(() => {
    if (!isUserDisConnected) {
      setShowConnectedMsg(true);
      const timer = setTimeout(() => setShowConnectedMsg(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUserDisConnected]);

  // if (showConnectedMsg) {
  //   return (
  //     <Text className="z-100 text-center w-full text-sm font-semibold bg-green-600 text-white">
  //       Connected to server
  //     </Text>
  //   );
  // } else if (isUserDisConnected) {
  //   return (
  //     <Text className="z-100 text-center w-full text-sm font-semibold bg-muted-600 text-white">{internetStatus}</Text>
  //   );
  // } else return null;

  if (isUserDisConnected)
    return (
      <Text className="z-100 text-center w-full text-sm font-semibold bg-muted-600 text-white">{internetStatus}</Text>
    );
  else return <></>;
}

export default React.memo(BusLocationManager);
