import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppSelector } from "@/store/storeConfig";

export default StatusOverlayComponent = () => {
  const { activeBuses, currentlyConnectedUserCount } = useAppSelector((state) => state.busLocation);
  return (
    <View className="absolute top-4 right-2 bg-white px-2 py-1 rounded-lg shadow-lg border border-muted-300">
      <View className="flex flex-row items-center">
        <Ionicons name="eye" size={15} color="#00C89B" style={{ marginRight: 6 }} />
        <Text className="text-[#00C89B] text-md font-bold">{currentlyConnectedUserCount}</Text>
      </View>

      <View className="flex flex-row items-center">
        <Ionicons name="bus" size={15} color="#2196F3" style={{ marginRight: 6 }} />
        <Text className="text-blue-600 text-md font-bold">{Object.keys(activeBuses).length}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
