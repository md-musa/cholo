import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

// Redux queries
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useGetBusesQuery } from "@/store/features/bus/busApi";

// Utilities & Components
import { playBeep } from "@/utils/payUtil";
import Navbar from "@/components/Navbar";

// Animations
import nfcScanImage from "@/assets/animatedImages/mobile-payment.json";
import paymentProcessingImage from "@/assets/animatedImages/finance-management.json";
import paymentSuccessImage from "@/assets/animatedImages/successfully-done.json";
import paymentFailureImage from "@/assets/animatedImages/payment-failed.json"; // Make sure to import this
import { axiosBaseQuery } from "@/config/axiosBaseQuery";
import apiClient from "@/config/axiosInstance";

export default function Index() {
  const [routeId, setRouteId] = useState<string | null>(null);
  const [busId, setBusId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "processing" | "success" | "fail">("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  console.log("RESULT------\n", JSON.stringify(result, null, 2));
  console.log("ERROR------\n", JSON.stringify(error, null, 2));

  const { data: routes } = useGetRoutesQuery();
  const { data: buses } = useGetBusesQuery();

  const startNfcScanLoop = useCallback(async () => {
    setIsScanning(true);
    setStatus("scanning");

    while (true) {
      try {
        console.log("🔄 Waiting for NFC...");
        await NfcManager.requestTechnology(NfcTech.Ndef, {
          alertMessage: "Tap your NFC card",
        });

        const tag = await NfcManager.getTag();
        const uid = tag?.id ?? "UNKNOWN";

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStatus("processing");
        console.log("✅ Scan Success:");

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const response = await apiClient.post("/payments/create-payment", {
          user: "xxxx",
          route: routeId,
          bus: busId,
          schedule: "xxxxx",
          nfcUid: uid,
          coords: [coords.longitude, coords.latitude],
        });

        console.log(JSON.stringify(response, null, 2));
        setResult(response);

        setStatus("success");
        await new Promise((res) => setTimeout(res, 10000)); // Pause to show success animation
      } catch (error) {
        console.log(JSON.stringify(error?.response?.data, null, 2));
        setStatus("fail");
        setError(error?.response?.data?.errorMessages[0]?.message);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        console.warn("❌ Scan Failed", error);
        await new Promise((res) => setTimeout(res, 1500)); // Pause to show error animation
      } finally {
        await NfcManager.cancelTechnologyRequest();
        setStatus("scanning");
        await new Promise((res) => setTimeout(res, 800)); // Delay before re-scanning
      }
    }
  }, [routeId, busId]);

  useEffect(() => {
    NfcManager.start();
  }, []);

  const renderAnimation = () => {
    switch (status) {
      case "scanning":
        return <LottieView source={nfcScanImage} autoPlay loop style={{ width: 200, height: 250 }} />;
      case "processing":
        return <LottieView source={paymentProcessingImage} autoPlay loop style={{ width: 200, height: 200 }} />;
      case "success":
        return <LottieView source={paymentSuccessImage} autoPlay loop={false} style={{ width: 200, height: 250 }} />;
      case "fail":
        return <LottieView source={paymentFailureImage} autoPlay loop={false} style={{ width: 200, height: 250 }} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white", paddingHorizontal: 14 }}>
      <Navbar />

      <View className="bg-primary-500 p-4 rounded-xl mb-5">
        {/* --------- Route Picker --------- */}
        <View className="flex flex-row items-center bg-white border border-muted-300 rounded-xl px-3 my-2">
          <MaterialCommunityIcons name="routes" size={24} color="#24204DE6" />
          <Picker
            selectedValue={routeId}
            onValueChange={(val) => {
              setRouteId(val);
              setBusId(null);
            }}
            style={{ flex: 1 }}
            enabled={!isScanning}
          >
            <Picker.Item label="Select a route" value={null} />
            {routes?.map((route: any) => (
              <Picker.Item key={route._id} label={route.routeName} value={route._id} />
            ))}
          </Picker>
        </View>

        {/* --------- Bus Picker --------- */}
        {routeId && (
          <View className="flex flex-row items-center bg-white border border-muted-300 rounded-xl px-3 my-2">
            <MaterialCommunityIcons name="bus" size={22} color="#24204DE6" />
            <Picker
              selectedValue={busId}
              onValueChange={(val) => setBusId(val)}
              style={{ flex: 1 }}
              enabled={!isScanning}
            >
              <Picker.Item label="Select a bus" value={null} />
              {buses?.map((bus: any) => (
                <Picker.Item key={bus._id} label={bus.name} value={bus._id} />
              ))}
            </Picker>
          </View>
        )}
      </View>

      {/* Scan Button */}
      {!isScanning && routeId && busId && (
        <View className="flex-1 items-center justify-center">
          <Button title="Start Scanning" onPress={startNfcScanLoop} />
        </View>
      )}

      {/* Animation Display */}
      <View className="flex-1 items-center justify-center">
        <View>{renderAnimation()}</View>

        {status == "scanning" && <Text className="text-2xl text-gray-800">Punch your student card</Text>}

        {status === "success" && result !== null && (
          <>
            <Text className="text-3xl font-semibold my-2">{result?.message}</Text>
            <Text className="text-2xl"> Stop: {result?.data.stop}</Text>
            <Text className="text-2xl"> Fare: {result?.data.fare} BDT</Text>
          </>
        )}
        {status === "processing" && <Text className="text-2xl text-gray-700"> Transaction is processing...</Text>}

        {status === "fail" && error && <Text className="text-3xl font-semibold">{error}</Text>}
        {status === "idle" && <Text className="text-gray-500 mt-2">Select Route and Bus Name</Text>}
      </View>
    </SafeAreaView>
  );
}
