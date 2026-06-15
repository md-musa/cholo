import { TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Settings",
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
          
          headerBackTitleVisible: true,
        })}
      />
      <Stack.Screen
        name="privaryAndPolicy"
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: "Privacy & Policy",
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
          
          headerBackTitleVisible: true,
        })}
      />
    </Stack>
  );
};

export default Layout;
