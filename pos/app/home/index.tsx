import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

import apiClient from "@/config/axiosInstance";
import LoadingScreen from "@/components/UI/LoadingScreen";
import MinimalHeader from "@/components/UI/MinimalHeader";
import NfcScanner from "@/components/UI/NfcScanner";

import { useAppSelector } from "@/store/storeConfig";
import { useLocationSharingContext } from "./LocationContext";
import { playSound, requestForegroundLocationPermission } from "@/utils/payUtil";
import { ToastUtil } from "@/utils/toastUtil";

import { ScanState, PaymentResponse } from "./types";

export default function PosHomeScreen() {
  const router = useRouter();

  // Auth & config state from Redux
  const { route, bus } = useAppSelector((state) => state.auth);

  // Sharing state from Context
  const { isSharingLocation } = useLocationSharingContext();

  // Local state for NFC Scan
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);

  // Redirection: if terminal route & bus are not set up, redirect to setup page
  useEffect(() => {
    if (!route || !bus) {
      router.replace("/home/setup");
    }
  }, [route, bus]);

  // NFC Scan process
  const handleScanCard = async () => {
    if (!route?._id || !bus?._id) {
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
      const uid = "04357972217680";

      if (!uid) {
        throw new Error("Unable to read card UID.");
      }

      setScanState("processing");

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const response = await apiClient.post("/trip/tap", {
        nfcUid: uid,
        routeId: route._id,
        busId: bus._id,
        coords: { lat: currentLocation.coords.longitude, lng: currentLocation.coords.latitude },
      });

      setLastTransaction(response);
      setScanState("success");
      playSound("success").catch(() => undefined);
      ToastUtil.success("Tap processed successfully.");
    } catch (error: any) {
      console.log(JSON.stringify(error));
      const message =
        error?.response?.data?.errorMessages?.[0]?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Transaction failed.";

      setScanError(message);
      setScanState("error");
      playSound("error").catch(() => undefined);
      ToastUtil.error(message);
    }
  };

  if (!route || !bus) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.scanContainer}>
        <MinimalHeader
          routeNo={route.routeNo}
          routeName={route.routeName}
          busName={bus.name}
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
