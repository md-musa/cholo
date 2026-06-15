import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import * as Location from "expo-location";
import { router } from "expo-router";

import apiClient from "@/config/axiosInstance";
import LoadingScreen from "@/components/UI/LoadingScreen";
import Sidebar from "@/components/UI/Sidebar";
import TripSetup from "@/components/UI/TripSetup";
import MinimalHeader from "@/components/UI/MinimalHeader";
import NfcScanner from "@/components/UI/NfcScanner";

import { ASYNC_STORAGE_KEYS } from "@/constants";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { clearCredentials, updateRoute } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { playSound, requestForegroundLocationPermission } from "@/utils/payUtil";
import { ToastUtil } from "@/utils/toastUtil";

import { ScanState, PaymentResponse } from "./types";

export default function PosHomeScreen() {
  const dispatch = useAppDispatch();
  
  // Auth state & Queries
  const { user, route: assignedRoute } = useAppSelector((state) => state.auth);
  const { data: routes = [], isLoading: isRoutesLoading } = useGetRoutesQuery();
  const { data: buses = [], isLoading: isBusesLoading } = useGetBusesQuery();

  // Local state
  const [routeId, setRouteId] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);

  // Location sharing hook
  const {
    isSharingLocation,
    activeTripId,
    lastLocationText,
    isStartingTrip,
    stopForegroundLocationSharing,
    handleLocationToggle,
  } = useLocationSharing({ user });

  const selectedRoute = useMemo(
    () => routes.find((item: any) => item._id === routeId) ?? assignedRoute ?? null,
    [assignedRoute, routeId, routes]
  );
  const selectedBus = useMemo(
    () => buses.find((item: any) => item._id === busId) ?? null,
    [busId, buses]
  );

  // Initialization: Load route and bus from storage
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedRoute = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE);
        if (storedRoute) {
          const parsedRoute = JSON.parse(storedRoute);
          setRouteId(parsedRoute._id);
          dispatch(updateRoute(parsedRoute));
        } else if (assignedRoute) {
          setRouteId(assignedRoute._id);
        }

        const storedBus = await AsyncStorage.getItem("current_bus");
        if (storedBus) {
          setBusId(storedBus);
        }
      } catch (err) {
        console.log("Error loading storage on startup:", err);
      }
    };

    loadStorage();
    NfcManager.start().catch(() => undefined);

    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => undefined);
    };
  }, [assignedRoute, dispatch]);

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
    if (value) {
      await AsyncStorage.setItem("current_bus", value);
    } else {
      await AsyncStorage.removeItem("current_bus");
    }
  };

  // NFC Scan process
  const handleScanCard = async () => {
    if (!routeId || !selectedBus) {
      ToastUtil.error("Select route and bus before scanning.");
      return;
    }

    const permissionGranted = await requestForegroundLocationPermission();
    if (!permissionGranted) {
      return;
    }

    setScanError(null);
    setLastTransaction(null);
    setScanState("scanning");

    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: "Tap passenger card to the phone",
      });

      const tag = await NfcManager.getTag();
      const uid = tag?.id;

      if (!uid) {
        throw new Error("Unable to read card UID.");
      }

      setScanState("processing");

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const response = await apiClient.post("/payments/create-payment", {
        nfcUid: uid,
        routeId,
        busId: selectedBus._id,
        tripId: activeTripId,
        operatorId: user?._id,
        timestamp: new Date().toISOString(),
        coords: [currentLocation.coords.longitude, currentLocation.coords.latitude],
      });

      setLastTransaction(response);
      setScanState("success");
      playSound("success").catch(() => undefined);
      ToastUtil.success("Tap processed successfully.");
    } catch (error: any) {
      const message =
        error?.response?.data?.errorMessages?.[0]?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Transaction failed.";

      setScanError(message);
      setScanState("error");
      playSound("error").catch(() => undefined);
      ToastUtil.error(message);
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => undefined);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    stopForegroundLocationSharing();
    await AsyncStorage.multiRemove([
      ASYNC_STORAGE_KEYS.AUTH_TOKEN,
      ASYNC_STORAGE_KEYS.CURRENT_ROUTE,
      "current_bus",
    ]);
    dispatch(clearCredentials());
    router.replace("/login");
  };

  if (isRoutesLoading || isBusesLoading) {
    return <LoadingScreen />;
  }

  const isTripSetup = routeId !== null && busId !== null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        routeId={routeId}
        routes={routes}
        onRouteChange={handleRouteChange}
        busId={busId}
        buses={buses}
        onBusChange={handleBusChange}
        isSharingLocation={isSharingLocation}
        lastLocationText={lastLocationText}
        isStartingTrip={isStartingTrip}
        onLocationToggle={() => handleLocationToggle(routeId, selectedBus)}
        activeTripId={activeTripId}
        onLogout={handleLogout}
      />

      {!isTripSetup ? (
        <TripSetup
          routeId={routeId}
          routes={routes}
          onRouteChange={handleRouteChange}
          busId={busId}
          buses={buses}
          onBusChange={handleBusChange}
          onSubmit={() => ToastUtil.success("Terminal successfully initialized.")}
        />
      ) : (
        <View style={styles.scanContainer}>
          <MinimalHeader
            onMenuPress={() => setIsSidebarOpen(true)}
            routeNo={selectedRoute?.routeNo}
            routeName={selectedRoute?.routeName}
            busName={selectedBus?.name}
            isSharingLocation={isSharingLocation}
          />
          <NfcScanner
            scanState={scanState}
            scanError={scanError}
            lastTransaction={lastTransaction}
            onScanCard={handleScanCard}
            onReset={() => setScanState("idle")}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scanContainer: {
    flex: 1,
  },
});
