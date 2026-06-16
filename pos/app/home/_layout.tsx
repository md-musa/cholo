import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LocationSharingProvider } from "./LocationContext";

export default function HomeLayout() {
  return (
    <LocationSharingProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#0f172a",
            borderTopColor: "#1e293b",
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarActiveTintColor: "#10b981",
          tabBarInactiveTintColor: "#64748b",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "NFC Scanner",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "card" : "card-outline"} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="location"
          options={{
            title: "Location",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "navigate" : "navigate-outline"} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "settings" : "settings-outline"} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="setup"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </LocationSharingProvider>
  );
}
