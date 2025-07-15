import { colors } from "@/config/colors";
import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";

type LoadingScreenProps = {
  color?: string;
  size?: "small" | "large";
};

function LoadingScreen({ color = colors.secondary[600], size = "large" }: LoadingScreenProps) {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

export default LoadingScreen;
