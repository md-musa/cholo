import { Tabs } from "expo-router";
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import {colors} from "@/config/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.secondary[500], // Active icon/text color
        tabBarInactiveTintColor: colors.muted[500], // Inactive icon/text color
        tabBarStyle: {
          backgroundColor: "#FFFFFF", // Tab bar background
          borderTopWidth: 0,
          paddingBottom: 4,
          height: 55,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedules"
        options={{
          title: "Schedules",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="schedule" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="broadcast"
        options={{
          title: "Broadcast",
          tabBarIcon: ({ color, size }) => <FontAwesome5 name="broadcast-tower" size={21} color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="notification"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" size={21} color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="setting"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={21} color={color} />,
        }}
      />
    </Tabs>
  );
}
