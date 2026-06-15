import { Stack } from "expo-router";

const RootLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs Navigator */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Stack Pages (outside tabs) */}
      <Stack.Screen name="watchBusLocation" />
    </Stack>
  );
};

export default RootLayout;
