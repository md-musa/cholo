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
import { useLocationSharingContext } from "@/contexts/LocationContext";
import { playSound, requestForegroundLocationPermission } from "@/utils/payUtil";
import { ToastUtil } from "@/utils/toastUtil";

import { ScanState, PaymentResponse } from "@/contexts/types";

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
  const latestLocationRef = useRef<Location.LocationObject | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let mounted = true;

    const startWatching = async () => {
      const permissionGranted = await requestForegroundLocationPermission();
      if (!permissionGranted || !mounted) {
        return;
      }

      try {
        //console.log("[GPS Watch] Starting watchPositionAsync with timeInterval: 5000...");
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Low,
            timeInterval: 5000,
            distanceInterval: 0,
          },
          (location) => {
            if (mounted) {
              latestLocationRef.current = location;
              //console.log(`[GPS Watch] Updated location: lat=${location.coords.latitude}, lng=${location.coords.longitude} (accuracy: ${location.coords.accuracy}m, timestamp: ${new Date(location.timestamp).toISOString()})`);
            }
          },
        );
      } catch (err) {
        console.log("[GPS Watch] Error starting watchPositionAsync:", err);
      }
    };

    startWatching();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.remove();
        //console.log("[GPS Watch] Stopped watchPositionAsync.");
      }
    };
  }, []);

  const scheduleReset = useCallback((nextState: ScanState = "scanning") => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = setTimeout(() => {
      setLastTransaction(null);
      setScanError(null);
      setScanState(nextState);
    }, 5000);
  }, []);

  const processScan = useCallback(
    async (uid: string) => {
      const scanStartTime = Date.now();
      //console.log(`[POS Scan] ========================================`);
      // console.log(`[POS Scan] NFC UID scanned: ${uid} at ${new Date(scanStartTime).toISOString()}`);

      if (!route?._id || !bus?._id) {
        // console.log(`[POS Scan] Error: No route (${route?._id}) or bus (${bus?._id}) assigned.`);
        setScanError("No route or bus is assigned to this POS device.");
        setScanState("error");
        scheduleReset("idle");
        return;
      }

      if (processingRef.current) {
        // console.log(`[POS Scan] Rejected: Another scan is currently being processed.`);
        return;
      }

      processingRef.current = true;

      const permissionGranted = await requestForegroundLocationPermission();
      if (!permissionGranted) {
        // console.log(`[POS Scan] Error: Foreground location permission denied.`);
        processingRef.current = false;
        return;
      }

      setScanError(null);
      setLastTransaction(null);
      setScanState("processing");

      try {
        let currentLocation = latestLocationRef.current;
        const now = Date.now();

        if (currentLocation && now - currentLocation.timestamp <= 10000) {
          // console.log(`[POS Scan] Using active watched location (age: ${now - currentLocation.timestamp}ms, coords: ${currentLocation.coords.latitude}, ${currentLocation.coords.longitude})`);
        } else {
          // console.log(`[POS Scan] Watched location is ${currentLocation ? `stale (age: ${now - currentLocation.timestamp}ms)` : "null"}. Querying last known location...`);

          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown && now - lastKnown.timestamp <= 30000) {
            currentLocation = lastKnown;
            // console.log(`[POS Scan] Using last known location (age: ${now - lastKnown.timestamp}ms, coords: ${lastKnown.coords.latitude}, ${lastKnown.coords.longitude})`);
          } else if (lastKnown) {
            // Accept stale last known — GPS watcher will refresh it soon.
            // Stale coordinates are acceptable for bus fare calculation.
            currentLocation = lastKnown;
            //console.log(`[POS Scan] Using stale last known location (age: ${now - lastKnown.timestamp}ms, coords: ${lastKnown.coords.latitude}, ${lastKnown.coords.longitude})`);
          } else if (latestLocationRef.current) {
            // Fall back to stale watched ref
            currentLocation = latestLocationRef.current;
            //console.log(`[POS Scan] Using stale watched ref location (age: ${now - latestLocationRef.current.timestamp}ms)`);
          }
        }

        if (!currentLocation) {
          throw new Error("Could not retrieve GPS coordinates.");
        }

        //console.log(`[POS Scan] Sending request to /trip/tap...`);
        const apiStartTime = Date.now();
        const response = await apiClient.post("/trip/tap", {
          nfcUid: uid,
          routeId: route._id,
          busId: bus._id,
          coords: {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          },
        });
        //console.log(`[POS Scan] Response received from /trip/tap in ${Date.now() - apiStartTime}ms:`, JSON.stringify(response));

        setLastTransaction(response);
        setScanState("success");
        playSound("success").catch(() => undefined);
        scheduleReset(nfcSupported ? "scanning" : "idle");
      } catch (error: any) {
        //console.log(`[POS Scan] Error in processScan:`, JSON.stringify(error));
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
        //console.log(`[POS Scan] Scan processing completed in ${Date.now() - scanStartTime}ms`);
        //console.log(`[POS Scan] ========================================`);
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
        //console.log("NFC init error:", JSON.stringify(error, null, 2));
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
