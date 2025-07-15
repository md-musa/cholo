import { colors } from "@/config/colors";
import React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native";

function LoadingIndicator({ color = colors.secondary[600] }) {
  return <ActivityIndicator size="small" color={color} />;
}

export default LoadingIndicator;
