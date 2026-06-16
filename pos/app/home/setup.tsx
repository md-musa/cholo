import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

import LoadingScreen from "@/components/UI/LoadingScreen";
import TripSetup from "@/components/UI/TripSetup";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { updateRoute, updateBus } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { ToastUtil } from "@/utils/toastUtil";

export default function TerminalSetupScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Auth & Queries
  const { route, bus } = useAppSelector((state) => state.auth);
  const { data: routes = [], isLoading: isRoutesLoading } = useGetRoutesQuery();
  const { data: buses = [], isLoading: isBusesLoading } = useGetBusesQuery();

  // Selected state
  const [routeId, setRouteId] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);

  // If already set up, redirect to main NFC scanner screen
  useEffect(() => {
    if (route && bus) {
      router.replace("/home");
    }
  }, [route, bus]);

  // Sync state with redux store on mount (e.g. if one was set)
  useEffect(() => {
    if (route) {
      setRouteId(route._id);
    }
    if (bus) {
      setBusId(bus._id);
    }
  }, [route, bus]);

  // Handle route change
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

  // Handle bus change
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
      ToastUtil.error("Please select both route and bus.");
      return;
    }
    ToastUtil.success("Terminal successfully initialized.");
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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
});
