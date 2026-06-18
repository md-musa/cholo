import { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import NfcManager, { NfcAdapter, NfcEvents, TagEvent } from "react-native-nfc-manager";

import apiClient from "@/config/axiosInstance";
import LoadingScreen from "@/components/UI/LoadingScreen";
import MinimalHeader from "@/components/UI/MinimalHeader";
import NfcScanner from "@/components/UI/NfcScanner";
import { useAppSelector } from "@/store/storeConfig";
import { playSound, requestForegroundLocationPermission } from "@/utils/payUtil";

import { useLocationSharingContext } from "./LocationContext";
import { PaymentResponse, ScanState } from "./types";

const DEMO_NFC_UID = "04357972217680";
const RESULT_TIMEOUT_MS = 2000;
const ERROR_TIMEOUT_MS = 3000;

export default function PosHomeScreen() {
  const router = useRouter();
  const { route, bus } = useAppSelector((state) => state.auth);
  const { isSharingLocation } = useLocationSharingContext();

  const [scanState, setScanState] = useState<ScanState>("ready");
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] = useState<PaymentResponse | null>(null);
  const [isNfcAvailable, setIsNfcAvailable] = useState(true);

  const latestScanRef = useRef(0);
  const resultTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResultTimeout = useCallback(() => {
    if (resultTimeoutRef.current) {
      clearTimeout(resultTimeoutRef.current);
      resultTimeoutRef.current = null;
    }
  }, []);

  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const resetToReady = useCallback(() => {
    clearResultTimeout();
    setLastTransaction(null);
    setScanState("ready");
  }, [clearResultTimeout]);

  const showInlineError = useCallback(
    (message: string) => {
      clearErrorTimeout();
      setScanError(message);
      errorTimeoutRef.current = setTimeout(() => {
        setScanError(null);
      }, ERROR_TIMEOUT_MS);
    },
    [clearErrorTimeout],
  );

  useEffect(() => {
    if (!route || !bus) {
      router.replace("/home/setup");
    }
  }, [bus, route, router]);

  const processCardTap = useCallback(
    async (nfcUid: string) => {
      if (!route?._id || !bus?._id) {
        showInlineError("Select route and bus before scanning.");
        return;
      }

      const permissionGranted = await requestForegroundLocationPermission();
      if (!permissionGranted) {
        showInlineError("Location permission is required to process the card.");
        return;
      }

      const currentScanId = Date.now();
      latestScanRef.current = currentScanId;
      clearResultTimeout();
      clearErrorTimeout();
      setScanError(null);
      setLastTransaction(null);
      setScanState("processing");

      try {
        if (!nfcUid) {
          throw new Error("Unable to read card UID.");
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const response = (await apiClient.post("/trip/tap", {
          nfcUid,
          routeId: route._id,
          busId: bus._id,
          coords: {
            lat: currentLocation.coords.latitude,
            lng: currentLocation.coords.longitude,
          },
        })) as PaymentResponse;

        if (latestScanRef.current !== currentScanId) {
          return;
        }

        setLastTransaction(response);
        setScanState("success");
        playSound("success").catch(() => undefined);

        resultTimeoutRef.current = setTimeout(() => {
          if (latestScanRef.current === currentScanId) {
            resetToReady();
          }
        }, RESULT_TIMEOUT_MS);
      } catch (error: any) {
        if (latestScanRef.current !== currentScanId) {
          return;
        }

        const message =
          error?.response?.data?.errorMessages?.[0]?.message ||
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          "Transaction failed.";

        setScanState("ready");
        playSound("error").catch(() => undefined);
        showInlineError(message);
      }
    },
    [bus?._id, clearErrorTimeout, clearResultTimeout, resetToReady, route?._id, showInlineError],
  );

  useEffect(() => {
    let isMounted = true;

    const setupNfc = async () => {
      try {
        const supported = await NfcManager.isSupported();
        if (!supported) {
          if (isMounted) {
            setIsNfcAvailable(false);
            showInlineError("This device does not support NFC.");
          }
          return;
        }

        await NfcManager.start();
        const enabled = await NfcManager.isEnabled();

        if (isMounted) {
          setIsNfcAvailable(enabled);
          if (!enabled) {
            showInlineError("NFC is turned off. Enable it in device settings.");
          }
        }

        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
          const tagId = tag.id?.trim();
          if (tagId) {
            processCardTap(tagId);
          }
        });

        await NfcManager.registerTagEvent({
          alertMessage: "Ready to scan NFC card",
          invalidateAfterFirstRead: false,
          isReaderModeEnabled: true,
          readerModeFlags:
            NfcAdapter.FLAG_READER_NFC_A |
            NfcAdapter.FLAG_READER_NFC_B |
            NfcAdapter.FLAG_READER_NFC_F |
            NfcAdapter.FLAG_READER_NFC_V |
            NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK |
            NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS,
        });
      } catch (error: any) {
        if (isMounted) {
          setIsNfcAvailable(false);
          showInlineError(error?.message || "Unable to start NFC reader.");
        }
      }
    };

    setupNfc();

    return () => {
      isMounted = false;
      clearResultTimeout();
      clearErrorTimeout();
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.unregisterTagEvent().catch(() => undefined);
    };
  }, [clearErrorTimeout, clearResultTimeout, processCardTap, showInlineError]);

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
          isNfcAvailable={isNfcAvailable}
          onTestScan={() => processCardTap(DEMO_NFC_UID)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scanContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
