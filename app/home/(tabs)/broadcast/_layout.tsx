import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/store/storeConfig";

// Replace this with your actual isBroadcasting source

const Layout = () => {

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Share Location",
          headerTitleAlign: "left",
          headerStyle: {
            backgroundColor: "white",
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: "bold",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-muted-100 rounded-full p-1 mx-2">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("setting")} className="mr-2">
              <Ionicons name="menu" size={27} color="black" />
            </TouchableOpacity>
          ),
          headerBackTitleVisible: true,
        })}
      />
      <Stack.Screen name="liveLocationSharing" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
