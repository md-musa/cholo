import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import NfcManager, { NfcTech } from "react-native-nfc-manager";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { useGetBusesQuery } from "@/store/features/bus/busApi";
import { playBeep } from "@/utils/payUtil";
import Navbar from "@/components/Navbar";
import nfcScanImage from "@/assets/animatedImages/mobile-payment.json";
import paymentProcessingImage from "@/assets/animatedImages/finance-management.json";
import paymentSuccessImage from "@/assets/animatedImages/successfully-done.json";
import paymentFailureImage from "@/assets/animatedImages/payment-failed.json"; // Make sure to import this
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

        setStatus("processing");
        console.log("✅ Scan Success:");

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const response = await apiClient.post("/payments/create-payment", {
          userId: "xxxx",
          routeId: routeId,
          busId: busId,
          scheduleId: "xxxxx",
          nfcUid: uid,
          coords: [coords.longitude, coords.latitude],
        });

        console.log(JSON.stringify(response, null, 2));
        setResult(response);
        await playBeep();
        setStatus("success");
        await new Promise((res) => setTimeout(res, 8000));
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
      case "scanning":
        return <></>;
      case "processing":
        // return <LottieView source={paymentProcessingImage} autoPlay loop style={{ width: 200, height: 200 }} />;
        return <></>;
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
      </View>

      {/* Scan Button */}
      {!isScanning && routeId && busId && (
        <View className="">
          <Button title="Start Scanning" onPress={startNfcScanLoop} />
        </View>
      )}

      {/* Animation Display */}
      <View className="flex-1 items-center mb-2 justify-center bg-white p-6 border border-primary-200 shadow-md rounded-xl">
        {/* Animation Container */}
        <View className="">{renderAnimation()}</View>

        {/* Status Messages */}
        {status === "scanning" && (
          <>
            <Text className="text-2xl font-medium  mb-4 text-center">Please Scan Your Card</Text>
            <Text className="text-md  text-gray-800 mb-4 text-center">Hold you card to the back of the phone.</Text>
          </>
        )}

        {status === "processing" && (
          <View className="flex items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-2xl font-medium text-blue-600 my-4">Processing...</Text>
          </View>
        )}

        {/* Success State */}
        {status === "success" && result !== null && (
          <View className="w-full max-w-md bg-white rounded-xl ">
            <Text className="text-3xl font-bold text-green-600 text-center mb-4">{result?.message}</Text>

            <View className="space-y-4">
              <View className="flex-row justify-between border-b pb-2">
                <Text className="text-lg font-medium text-gray-600">Stopage:</Text>
                <Text className="text-2xl font-semibold">
                  {result?.data.startStopage}
                  {result?.data.endStopage && ` → ${result.data.endStopage}`}
                </Text>
              </View>

              {result?.data.fare >= 0 && (
                <View className="flex-row justify-between border-b pb-2">
                  <Text className="text-lg font-medium text-gray-600">Fare:</Text>
                  <Text className="text-lg font-bold text-blue-700">{result?.data.fare} BDT</Text>
                </View>
              )}

              {result?.data.distanceInKm && (
                <View className="flex-row justify-between border-b pb-2">
                  <Text className="text-lg font-medium text-gray-600">Distance:</Text>
                  <Text className="text-lg font-semibold">{result?.data.distanceInKm.toFixed(2)} KM</Text>
                </View>
              )}
              <View className="flex-row justify-between border-b pb-2">
                <Text className="text-lg font-medium text-gray-600">Passenger:</Text>
                <Text className="text-lg">{result?.data.userName}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-lg font-medium text-gray-600">Balance:</Text>
                <Text className="text-lg font-bold">{result?.data.userBalance} BDT</Text>
              </View>
            </View>
          </View>
        )}

        {/* Error State */}
        {status === "fail" && error && (
          <View className="w-full max-w-md bg-red-50 rounded-xl p-6 border border-red-200">
            <Text className="text-2xl font-bold text-red-600 text-center mb-2">Transaction Failed</Text>
            <Text className="text-lg text-red-500 text-center">{error}</Text>
          </View>
        )}

        {/* Idle State */}
        {!routeId && !busId && (
          <View className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <Text className="text-xl font-medium text-blue-700 text-center">Please select Route and Bus Name</Text>
            <Text className="text-gray-500 text-center mt-2">Your transaction details will appear here</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
