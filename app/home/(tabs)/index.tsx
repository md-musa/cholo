import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import NfcManager, { NfcTech, Ndef } from "react-native-nfc-manager"; // install & configure

// Dummy data – replace with your API hooks or redux selectors
const ROUTES = [
  { _id: "r1", name: "R12" },
  { _id: "r2", name: "R22" },
];
const BUSES = {
  r1: [
    { _id: "b1", name: "Dolphin 1" },
    { _id: "b2", name: "Rojnigondha 3" },
  ],
  r2: [{ _id: "b3", name: "Sunflower" }],
};
const SCHEDULES = {
  b1: [
    { _id: "s1", time: "07:00" },
    { _id: "s2", time: "08:30" },
  ],
  b2: [{ _id: "s3", time: "12:45" }],
};

export default function NFCScannerPage() {
  // selectors
  const [routeId, setRouteId] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  // scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    nfcUid: string;
    routeId: string;
    busId: string;
    scheduleId: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  /* -------- NFC Helpers -------- */
  const readNfcTag = useCallback(async () => {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: "Tap your NFC card",
      });
      const tag = await NfcManager.getTag();
      const uid = tag?.id ?? "UNKNOWN";

      // Get location (foreground permission assumed granted!)
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setScanResult({
        nfcUid: uid,
        routeId: routeId!,
        busId: busId!,
        scheduleId: scheduleId!,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (err) {
      console.warn("NFC scan failed", err);
    } finally {
      setIsScanning(false);
      NfcManager.cancelTechnologyRequest();
    }
  }, [routeId, busId, scheduleId]);

  /* -------- UI Reaction: start scan whenever prereqs ready -------- */
  useEffect(() => {
    if (!routeId || !busId || !scheduleId || isScanning) return;
    setIsScanning(true);
    readNfcTag();
  }, [readNfcTag, routeId, busId, scheduleId]);

  /* -------- initialize NFC -------- */
  useEffect(() => {
    NfcManager.start();
  }, []);

  return (
    <View className="flex-1 p-4 bg-white">
      {/* ------------- selectors ------------- */}
      <Text className="font-semibold mb-1">Select Route</Text>
      <Picker selectedValue={routeId} onValueChange={(v) => {
        setRouteId(v);
        setBusId(null);
        setScheduleId(null);
      }}>
        <Picker.Item label="Select a route" value={null} />
        {ROUTES.map((r) => (
          <Picker.Item key={r._id} label={r.name} value={r._id} />
        ))}
      </Picker>

      {/* Bus Picker */}
      {routeId && (
        <>
          <Text className="font-semibold mt-4 mb-1">Select Bus</Text>
          <Picker selectedValue={busId} onValueChange={(v) => {
            setBusId(v);
            setScheduleId(null);
          }}>
            <Picker.Item label="Select a bus" value={null} />
            {BUSES[routeId]?.map((b) => (
              <Picker.Item key={b._id} label={b.name} value={b._id} />
            ))}
          </Picker>
        </>
      )}

      {/* Schedule Picker */}
      {busId && (
        <>
          <Text className="font-semibold mt-4 mb-1">Select Schedule</Text>
          <Picker selectedValue={scheduleId} onValueChange={(v) => setScheduleId(v)}>
            <Picker.Item label="Select a time" value={null} />
            {SCHEDULES[busId]?.map((s) => (
              <Picker.Item key={s._id} label={s.time} value={s._id} />
            ))}
          </Picker>
        </>
      )}

      {/* ------------- Scanner Status ------------- */}
      <View className="flex-1 items-center justify-center">
        {isScanning && (
          <>
            <ActivityIndicator size="large" />
            <Text className="mt-2 font-medium">Waiting for NFC card…</Text>
          </>
        )}
        {scanResult && (
          <View className="p-4 rounded-lg border border-gray-300 w-full">
            <Text className="font-bold text-lg mb-2">Scan Result</Text>
            <Text>NFC UID: {scanResult.nfcUid}</Text>
            <Text>Route ID: {scanResult.routeId}</Text>
            <Text>Bus ID: {scanResult.busId}</Text>
            <Text>Schedule ID: {scanResult.scheduleId}</Text>
            <Text>
              Lat/Lng: {scanResult.latitude.toFixed(6)}, {scanResult.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
