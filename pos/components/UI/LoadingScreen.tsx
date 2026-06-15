import { colors } from "@/config/colors";
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

type LoadingScreenProps = {
  color?: string;
  size?: "small" | "large";
};

function LoadingScreen({ color = colors.secondary[600], size = "large" }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});

export default LoadingScreen;
