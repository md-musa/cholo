import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import LoadingScreen from "@/components/UI/LoadingScreen";
import TripSetup from "@/components/UI/TripSetup";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { updateBus, updateRoute } from "@/store/features/auth/authSlice";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";

export default function TerminalSetupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { route, bus } = useAppSelector((state) => state.auth);
  const { data: routes = [], isLoading: isRoutesLoading } = useGetRoutesQuery();
  const { data: buses = [], isLoading: isBusesLoading } = useGetBusesQuery();

  const [routeId, setRouteId] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (route && bus) {
      router.replace("/home");
    }
  }, [bus, route, router]);

  useEffect(() => {
    if (route) {
      setRouteId(route._id);
    }
    if (bus) {
      setBusId(bus._id);
    }
  }, [bus, route]);

  const handleRouteChange = async (value: string | null) => {
    setRouteId(value);
    const routeObj = routes.find((item: any) => item._id === value) ?? null;
    dispatch(updateRoute(routeObj));

    if (routeObj) {
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(routeObj));
    } else {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE);
    }
  };

  const handleBusChange = async (value: string | null) => {
    setBusId(value);
    const busObj = buses.find((item: any) => item._id === value) ?? null;
    dispatch(updateBus(busObj));

    if (busObj) {
      await AsyncStorage.setItem("current_bus", JSON.stringify(busObj));
    } else {
      await AsyncStorage.removeItem("current_bus");
    }
  };

  const handleSubmit = () => {
    if (!routeId || !busId) {
      setMessage("Please select both route and bus.");
      return;
    }

    setMessage(null);
    router.replace("/home");
  };

  if (isRoutesLoading || isBusesLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TripSetup
        routeId={routeId}
        routes={routes}
        onRouteChange={handleRouteChange}
        busId={busId}
        buses={buses}
        onBusChange={handleBusChange}
        onSubmit={handleSubmit}
        message={message}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
