import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import LoadingScreen from "@/components/UI/LoadingScreen";
import MinimalHeader from "@/components/UI/MinimalHeader";

import { useAppSelector } from "@/store/storeConfig";
import { useLocationSharingContext } from "./LocationContext";

export default function LocationSharingScreen() {
  const router = useRouter();

  // Auth & config state from Redux
  const { route, bus } = useAppSelector((state) => state.auth);
  //console.log(route, bus);

  // Location sharing state from Context
  const {
    isSharingLocation,
    lastLocationText,
    handleLocationToggle,
  } = useLocationSharingContext();

  // Redirection: if terminal route & bus are not set up, redirect to setup page
  useEffect(() => {
    if (!route || !bus) {
      router.replace("/home/setup");
    }
  }, [route, bus]);

  if (!route || !bus) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <MinimalHeader
          routeNo={route.routeNo}
          routeName={route.routeName}
          busName={bus.name}
          isSharingLocation={isSharingLocation}
        />

        <View style={styles.content}>
          {/* Visual Radar/Pulsing Animation Placeholder */}
          <View style={styles.radarContainer}>
            <View style={[styles.radarCircle, styles.outerCircle, isSharingLocation && styles.pulseActiveOuter]}>
              <View style={[styles.radarCircle, styles.midCircle, isSharingLocation && styles.pulseActiveMid]}>
                <View style={[styles.radarCircle, styles.innerCircle, isSharingLocation && styles.pulseActiveInner]}>
                  <MaterialCommunityIcons
                    name={isSharingLocation ? "map-marker-radius" : "map-marker-outline"}
                    size={48}
                    color={isSharingLocation ? "#10b981" : "#64748b"}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Broadcast Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIndicator, isSharingLocation ? styles.bgActive : styles.bgInactive]} />
              <Text style={styles.statusTitle}>
                {isSharingLocation ? "Broadcasting Live Location" : "Location Sharing Paused"}
              </Text>
            </View>

            <Text style={styles.statusDescription}>
              {isSharingLocation
                ? "Your current coordinate updates are being sent to Transnova servers to update the passenger-facing arrival times."
                : "Please enable location sharing to start broadcasting this vehicle's position on the live map."}
            </Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#94a3b8" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>GPS Coordinates</Text>
                <Text style={styles.infoValue}>{lastLocationText}</Text>
              </View>
            </View>
          </View>

          {/* Action Toggle Button */}
          <TouchableOpacity
            onPress={() => handleLocationToggle(route._id, bus)}
            style={[
              styles.toggleBtn,
              isSharingLocation ? styles.btnStop : styles.btnStart,
            ]}
          >
            <View style={styles.btnContent}>
              <Ionicons
                name={isSharingLocation ? "stop-circle-outline" : "play-circle-outline"}
                size={24}
                color="white"
              />
              <Text style={styles.toggleBtnText}>
                {isSharingLocation ? "Stop Broadcast" : "Start Broadcasting"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#020617",
  },
  mainContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#090d16",
  },
  radarContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  radarCircle: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 9999,
  },
  outerCircle: {
    width: 220,
    height: 220,
    backgroundColor: "rgba(100, 116, 139, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.05)",
  },
  midCircle: {
    width: 160,
    height: 160,
    backgroundColor: "rgba(100, 116, 139, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.08)",
  },
  innerCircle: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(100, 116, 139, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.15)",
  },
  pulseActiveOuter: {
    backgroundColor: "rgba(16, 185, 129, 0.04)",
    borderColor: "rgba(16, 185, 129, 0.1)",
  },
  pulseActiveMid: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.15)",
  },
  pulseActiveInner: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#0f172a",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 24,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  bgActive: {
    backgroundColor: "#10b981",
  },
  bgInactive: {
    backgroundColor: "#64748b",
  },
  statusTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  statusDescription: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  marginTop: {
    marginTop: 16,
  },
  toggleBtn: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnStart: {
    backgroundColor: "#10b981",
  },
  btnStop: {
    backgroundColor: "#ef4444",
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
