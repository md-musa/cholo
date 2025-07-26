import { Tabs } from "expo-router";
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import { colors } from "@/config/colors";

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
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="history" size={21} color={color} />,
        }}
      />
    </Tabs>
  );
}
