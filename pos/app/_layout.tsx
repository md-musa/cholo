import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { store } from "@/store/storeConfig";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#ffffff" },
          }}
        />
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      </GestureHandlerRootView>
    </Provider>
  );
}
