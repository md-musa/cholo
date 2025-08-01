import React from "react";
import { View } from "react-native";
import RouteSelector from "@/components/RouteSelector";
import HomeMapSection from "@/components/HomeMapSection";
import Navbar from "@/components/Navbar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View className="flex-1 mx-4">
        <Navbar />
        {/* --- Select route and show Next bus schedule */}
        <RouteSelector />

        {/* --- Show live locations buses-- */}
        <HomeMapSection />
      </View>
    </SafeAreaView>
  );
}
