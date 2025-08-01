import { Stack } from "expo-router";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "@/store/storeConfig";
import BroadcastManager from "@/components/UI/BroadcastManager";
import BusLocationManager from "@/components/UI/BusLocationManager";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RootLayout() {
  // const netInfo = useNetInfo();

  // const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  // useEffect(() => {
  //   if (netInfo.isConnected) {
  //     setHasConnectedOnce(true);
  //   }
  // }, [netInfo.isConnected]);

  // if (!hasConnectedOnce && !netInfo.isConnected) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-neutral-50">
  //       <MaterialCommunityIcons name="wifi-off" size={64} color="#f87171" style={{ marginBottom: 16 }} />
  //       <Text className="text-xl font-bold text-red-500">No Internet Connection</Text>
  //       <Text className="text-base text-neutral-500 mt-2 text-center">Please check your connection and try again.</Text>
  //     </View>
  //   );
  // }

  // console.log("📶: ", netInfo.isConnected);

  return (
    <Provider store={store}>
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-white">
          <BroadcastManager />

          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "white" },
            }}
          />
          <Toasts />

          <BusLocationManager />
        </View>
      </GestureHandlerRootView>
    </Provider>
  );
}
