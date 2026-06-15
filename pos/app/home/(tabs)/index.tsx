// --- At the top of your Index.tsx file ---
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet, InteractionManager } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { checkEssentialPermissions, playSound } from "@/utils/payUtil";
import Navbar from "@/components/Navbar";
import nfcScanImage from "@/assets/animatedImages/nfc_reader.json";
import paymentSuccessImage from "@/assets/animatedImages/successfully-done.json";
import paymentFailureImage from "@/assets/animatedImages/payment-failed.json";
import apiClient from "@/config/axiosInstance";
import SuccessCard from "@/components/homeComponents/SuccessCard";
import { runOnJS } from "react-native-reanimated";

const RoutePicker = ({ routeId, setRouteId, setBusId, isScanning, routes }) => (
  <View className="flex flex-row items-center bg-white border border-muted-300 rounded-2xl px-3 mb-3">
    <View className="bg-[#F0F0F0] p-1.5 rounded-full mr-2">
      <MaterialCommunityIcons name="routes" size={22} color="#24204DE6" />
    </View>
    <Picker
      selectedValue={routeId}
      onValueChange={(val) => {
        setRouteId(val);
        setBusId(null);
      }}
      style={{ flex: 1 }}
      enabled={!isScanning}
      mode="dropdown"
    >
      <Picker.Item label="Select a Route" value={null} />
      {routes?.map((route) => (
        <Picker.Item
          key={route._id}
          label={route.routeName.charAt(0).toUpperCase() + route.routeName.slice(1)}
          value={route._id}
        />
      ))}
    </Picker>
  </View>
);

const BusPicker = ({ busId, setBusId, isScanning, buses }) => (
  <View className="flex flex-row items-center bg-white border border-muted-300 rounded-2xl px-3">
    <View className="bg-[#F0F0F0] p-1.5 rounded-full mr-2">
      <MaterialCommunityIcons name="bus" size={22} color="#24204DE6" />
    </View>
    <Picker selectedValue={busId} onValueChange={setBusId} style={{ flex: 1 }} enabled={!isScanning} mode="dropdown">
      <Picker.Item label="Select a Bus" value={null} />
      {buses?.map((bus) => (
        <Picker.Item key={bus._id} label={bus.name.charAt(0).toUpperCase() + bus.name.slice(1)} value={bus._id} />
      ))}
    </Picker>
  </View>
);

const ScanButton = ({ onPress, isDisabled }) => (
  <View>
    <Button title="Start Scanning" onPress={onPress} disabled={isDisabled} />
  </View>
);

const ScanStatusDisplay = ({ status, error, result, routeId, busId }) => {
  const renderAnimation = () => {
    switch (status) {
      case "scanning":
        return <LottieView source={nfcScanImage} autoPlay speed={0.7} loop style={{ width: 300, height: 300 }} />;
      case "processing":
        return <ActivityIndicator size="large" color="#006550" />;
      case "success":
        return <LottieView source={paymentSuccessImage} autoPlay loop={false} style={{ width: 200, height: 250 }} />;
      case "fail":
        return <LottieView source={paymentFailureImage} autoPlay loop={false} style={{ width: 200, height: 250 }} />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 items-center mb-2 justify-center bg-white p-6 border border-primary-200 shadow-md rounded-xl">
      {renderAnimation()}

      {status === "scanning" && (
        <>
          <Text className="text-2xl font-medium mb-4 text-center">Please Scan Your Card</Text>
          <Text className="text-md text-gray-800 mb-4 text-center">Hold your card to the back of the phone.</Text>
        </>
      )}

      {status === "processing" && <Text className="text-2xl font-medium text-[#006550] my-4">Processing...</Text>}

      {status === "success" && <SuccessCard result={result} status={status} />}

      {status === "fail" && (
        <View className="w-full max-w-md bg-red-50 rounded-xl p-6 border border-red-200">
          <Text className="text-2xl font-bold text-red-600 text-center mb-2">Transaction Failed</Text>
          <Text className="text-lg text-red-500 text-center">{error}</Text>
        </View>
      )}
      {status === "idle" && !routeId && !busId && <IdleCard />}
    </View>
  );
};

const IdleCard = () => (
  <View className="bg-blue-50 p-6 rounded-xl border border-blue-200">
    <Text className="text-xl font-medium text-blue-700 text-center">Please select Route and Bus Name</Text>
    <Text className="text-gray-500 text-center mt-2">Your transaction details will appear here</Text>
  </View>
);

export default function Index() {
  const [routeId, setRouteId] = useState(null);
  const [busId, setBusId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { data: routes } = useGetRoutesQuery();
  const { data: buses } = useGetBusesQuery();

  useEffect(() => {
    NfcManager.start();
    checkEssentialPermissions();
  }, []);

  const startNfcScanLoop = useCallback(() => {
    if (!routeId || !busId || isScanning) return;

    setIsScanning(true);

    const scan = async () => {
      setStatus("scanning");

      try {
        console.log("🔄 Waiting for NFC...");
        await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: "Tap your NFC card",
        });

        const tag = await NfcManager.getTag();
        const uid = tag?.id ?? "UNKNOWN";

        setStatus("processing");

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const response = await apiClient.post("/payments/create-payment", {
          userId: "xxxx",
          routeId,
          busId,
          scheduleId: "xxxxx",
          nfcUid: uid,
          coords: [coords.longitude, coords.latitude],
        });

        InteractionManager.runAfterInteractions(() => {
          playSound("success");
        });
        setResult(response);
        setStatus("success");

        // Wait before restarting scan
        await new Promise((res) => setTimeout(res, 5000));
      } catch (error) {
        InteractionManager.runAfterInteractions(() => {
          playSound("error");
        });
        setStatus("fail");
        setError(error?.response?.data?.errorMessages?.[0]?.message || "Scan failed");

        // Wait before restarting scan
        await new Promise((res) => setTimeout(res, 4000));
      } finally {
        await NfcManager.cancelTechnologyRequest();
        setStatus("idle");

        // Auto-restart after small delay
        setTimeout(() => {
          scan(); // restart scan
        }, 500);
      }
    };

    scan(); // Initial call
  }, [routeId, busId, isScanning]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 14 }}>
      <Navbar />

      <View className="bg-primary-500 p-5 rounded-2xl mb-6 shadow-md">
        <RoutePicker
          routeId={routeId}
          setRouteId={setRouteId}
          setBusId={setBusId}
          isScanning={isScanning}
          routes={routes}
        />
        <BusPicker busId={busId} setBusId={setBusId} isScanning={isScanning} buses={buses} />
      </View>

      <View className="flex-1">
        {status == "idle" && <ScanButton onPress={startNfcScanLoop} isDisabled={false} />}
        <ScanStatusDisplay status={status} error={error} result={result} routeId={routeId} busId={busId} />
      </View>
    </SafeAreaView>
  );
}
