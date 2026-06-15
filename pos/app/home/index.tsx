import { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import apiClient from "@/config/axiosInstance";
import socket from "@/config/socketIoConfig";
import LoadingScreen from "@/components/UI/LoadingScreen";
import { ASYNC_STORAGE_KEYS, BUS_TYPES, SOCKET_EVENTS } from "@/constants";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useCreateTripMutation } from "@/store/features/trip/tripApi";
import { clearCredentials } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { playSound, requestForegroundLocationPermission } from "@/utils/payUtil";
import { ToastUtil } from "@/utils/toastUtil";

type ScanState = "idle" | "scanning" | "processing" | "success" | "error";

type PaymentResponse = {
  message?: string;
  data?: {
    startStopage?: string;
    endStopage?: string;
    fare?: number;
    distanceInKm?: number;
    userName?: string;
    balance?: number;
  };
};

export default function PosHomeScreen() {
  const dispatch = useAppDispatch();
  const { user, route: assignedRoute } = useAppSelector((state) => state.auth);
  const { data: routes = [], isLoading: isRoutesLoading } = useGetRoutesQuery();
  const { data: buses = [], isLoading: isBusesLoading } = useGetBusesQuery();
  const [createTrip, { isLoading: isStartingTrip }] = useCreateTripMutation();

  const [routeId, setRouteId] = useState<string | null>(assignedRoute?._id ?? null);
  const [busId, setBusId] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [lastLocationText, setLastLocationText] = useState("Waiting for GPS");

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const mountedRef = useRef(true);

  const selectedRoute = useMemo(
    () => routes.find((item: any) => item._id === routeId) ?? assignedRoute ?? null,
    [assignedRoute, routeId, routes]
  );
  const selectedBus = useMemo(() => buses.find((item: any) => item._id === busId) ?? null, [busId, buses]);

  useEffect(() => {
    mountedRef.current = true;
    NfcManager.start().catch(() => undefined);

    return () => {
      mountedRef.current = false;
      NfcManager.cancelTechnologyRequest().catch(() => undefined);
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

  const startForegroundLocationSharing = async () => {
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

  const handleLocationToggle = async () => {
    if (isSharingLocation) {
      Alert.alert("Stop location sharing?", "This bus will no longer broadcast its live location.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: stopForegroundLocationSharing,
        },
      ]);
      return;
    }

    await startForegroundLocationSharing();
  };

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

  const handleLogout = async () => {
    stopForegroundLocationSharing();
    await AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.AUTH_TOKEN, ASYNC_STORAGE_KEYS.CURRENT_ROUTE]);
    dispatch(clearCredentials());
    router.replace("/login");
  };

  if (isRoutesLoading || isBusesLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Bus POS Console</Text>
            <Text style={styles.headerSubtitle}>
              Contactless fare collection and live bus location from the onboard phone.
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.whiteCard}>
          <Text style={styles.cardTitle}>Authenticated Device</Text>
          <Text style={styles.cardPrimaryText}>{user?.name || user?.email || "POS Operator"}</Text>
          <Text style={styles.cardSecondaryText}>{user?.email}</Text>
        </View>

        <View style={styles.whiteCard}>
          <Text style={[styles.cardTitle, styles.sectionSpacing]}>Trip Setup</Text>

          <Text style={styles.inputLabel}>Route</Text>
          <View style={[styles.pickerWrap, styles.sectionSpacing]}>
            <Picker selectedValue={routeId} onValueChange={(value) => setRouteId(value)}>
              <Picker.Item label="Select route" value={null} />
              {routes.map((route: any) => (
                <Picker.Item
                  key={route._id}
                  label={route.routeNo ? `${route.routeNo} - ${route.routeName}` : route.routeName}
                  value={route._id}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Bus</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={busId} onValueChange={(value) => setBusId(value)}>
              <Picker.Item label="Select bus" value={null} />
              {buses.map((bus: any) => (
                <Picker.Item key={bus._id} label={bus.name} value={bus._id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.rowBetweenCenter}>
            <View style={styles.locationTextWrap}>
              <Text style={styles.locationTitle}>Live Location</Text>
              <Text style={styles.locationSubtitle}>
                {isSharingLocation ? `Broadcasting for ${selectedBus?.name || "selected bus"}` : "Foreground-only location sharing"}
              </Text>
              <Text style={styles.locationMeta}>{lastLocationText}</Text>
            </View>
            <TouchableOpacity onPress={handleLocationToggle} disabled={isStartingTrip} style={styles.darkButton}>
              {isStartingTrip ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.darkButtonText}>{isSharingLocation ? "Stop" : "Start"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.whiteCard}>
          <View style={[styles.rowBetweenCenter, styles.sectionSpacing]}>
            <View style={styles.inlineRow}>
              <MaterialCommunityIcons name="contactless-payment-circle" size={26} color="#0f172a" />
              <Text style={styles.nfcTitle}>NFC Fare Collection</Text>
            </View>
            <Text style={styles.scanStateText}>{scanState}</Text>
          </View>

          <TouchableOpacity onPress={handleScanCard} style={styles.scanButton}>
            <Text style={styles.darkButtonText}>Scan Card</Text>
          </TouchableOpacity>

          <View style={styles.statusBox}>
            {scanState === "idle" && <Text style={styles.statusText}>Ready for the next passenger tap.</Text>}
            {scanState === "scanning" && <Text style={styles.statusText}>Waiting for card tap...</Text>}
            {scanState === "processing" && (
              <Text style={styles.statusText}>Processing check-in or check-out...</Text>
            )}
            {scanState === "error" && <Text style={styles.errorText}>{scanError}</Text>}
            {scanState === "success" && (
              <View>
                <Text style={styles.successText}>{lastTransaction?.message || "Transaction completed"}</Text>
                <Text style={styles.statusTextWithTop}>
                  {lastTransaction?.data?.startStopage || "Origin"}
                  {lastTransaction?.data?.endStopage ? ` -> ${lastTransaction.data.endStopage}` : ""}
                </Text>
                {typeof lastTransaction?.data?.fare === "number" && (
                  <Text style={styles.detailText}>Fare: {lastTransaction.data.fare} BDT</Text>
                )}
                {typeof lastTransaction?.data?.balance === "number" && (
                  <Text style={styles.detailText}>Balance: {lastTransaction.data.balance} BDT</Text>
                )}
                {lastTransaction?.data?.userName && (
                  <Text style={styles.detailText}>Passenger: {lastTransaction.data.userName}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentTitle}>Current Assignment</Text>
          <Text style={styles.assignmentText}>Route: {selectedRoute?.routeName || "Not selected"}</Text>
          <Text style={styles.assignmentText}>Bus: {selectedBus?.name || "Not selected"}</Text>
          <Text style={styles.assignmentText}>Trip: {activeTripId || "Location session not started"}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
  },
  headerSubtitle: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  whiteCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    color: "#0f172a",
    fontWeight: "600",
    marginBottom: 4,
  },
  cardPrimaryText: {
    color: "#334155",
  },
  cardSecondaryText: {
    color: "#64748b",
    marginTop: 4,
  },
  sectionSpacing: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#475569",
    marginBottom: 8,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    overflow: "hidden",
  },
  locationCard: {
    backgroundColor: "#10b981",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  rowBetweenCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  locationTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  locationSubtitle: {
    color: "#ecfdf5",
    marginTop: 4,
  },
  locationMeta: {
    color: "#d1fae5",
    marginTop: 12,
    fontSize: 14,
  },
  darkButton: {
    backgroundColor: "#020617",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 110,
    alignItems: "center",
  },
  darkButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nfcTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
  scanStateText: {
    fontSize: 14,
    color: "#64748b",
    textTransform: "capitalize",
  },
  scanButton: {
    backgroundColor: "#020617",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  statusBox: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  statusText: {
    color: "#475569",
  },
  statusTextWithTop: {
    color: "#475569",
    marginTop: 8,
  },
  errorText: {
    color: "#dc2626",
  },
  successText: {
    color: "#047857",
    fontWeight: "600",
  },
  detailText: {
    color: "#1e293b",
    marginTop: 4,
  },
  assignmentCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 20,
  },
  assignmentTitle: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  assignmentText: {
    color: "#cbd5e1",
    marginTop: 4,
  },
});
