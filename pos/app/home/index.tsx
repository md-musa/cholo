import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import NfcManager, { NfcEvents } from "react-native-nfc-manager";

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
  const { route, bus } = useAppSelector((state) => state.auth);
  const { isSharingLocation } = useLocationSharingContext();

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);
  const [nfcSupported, setNfcSupported] = useState<boolean>(false);
  const [nfcReady, setNfcReady] = useState(false);

  const processingRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReset = useCallback((nextState: ScanState = "scanning") => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setLastTransaction(null);
      setScanError(null);
      setScanState(nextState);
    }, 8000);
  }, []);

  const processScan = useCallback(
    async (uid: string) => {
      if (!route?._id || !bus?._id) {
        setScanError("No route or bus is assigned to this POS device.");
        setScanState("error");
        scheduleReset("idle");
        return;
      }

      if (processingRef.current) {
        return;
      }

      processingRef.current = true;

      const permissionGranted = await requestForegroundLocationPermission();
      if (!permissionGranted) {
        processingRef.current = false;
        return;
      }

      setScanError(null);
      setLastTransaction(null);
      setScanState("processing");

      try {
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
        scheduleReset(nfcSupported ? "scanning" : "idle");
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
        scheduleReset(nfcSupported ? "scanning" : "idle");
      } finally {
        processingRef.current = false;
      }
    },
    [bus, nfcSupported, route, scheduleReset],
  );

  useEffect(() => {
    let mounted = true;

    const setupNfc = async () => {
      try {
        const supported = await NfcManager.isSupported();
        if (!mounted) {
          return;
        }

        setNfcSupported(supported);
        if (!supported) {
          setScanState("idle");
          setNfcReady(true);
          return;
        }

        await NfcManager.start();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: any) => {
          const uid = tag?.id || tag?.uid;
          if (uid) {
            processScan(uid);
          }
        });
        await NfcManager.registerTagEvent();

        if (mounted) {
          setScanState("scanning");
          setNfcReady(true);
        }
      } catch (error) {
        console.log("NFC init error:", JSON.stringify(error, null, 2));
        if (mounted) {
          setNfcSupported(false);
          setScanState("idle");
          setNfcReady(true);
        }
      }
    };

    setupNfc();

    return () => {
      mounted = false;
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => undefined);
    };
  }, [processScan]);

  if (!route || !bus || !nfcReady) {
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
          nfcSupported={nfcSupported}
          scanState={scanState}
          scanError={scanError}
          lastTransaction={lastTransaction}
          onDemoScan={() => processScan("04357972217681")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f0ea",
  },
  scanContainer: {
    flex: 1,
    backgroundColor: "#f3f0ea",
  },
});
