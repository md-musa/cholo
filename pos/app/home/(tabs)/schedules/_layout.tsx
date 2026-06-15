import { TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={({ navigation }: { navigation: any }) => ({
          headerShown: true,
          headerTitle: "Schedules",
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
      <Stack.Screen
        name="waypoints"
        options={({ navigation }: { navigation: any }) => ({
          headerShown: true,
          headerTitle: "Stoppages",
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
    </Stack>
  );
};

export default Layout;
