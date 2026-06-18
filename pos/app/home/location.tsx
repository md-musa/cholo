import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import LoadingScreen from "@/components/UI/LoadingScreen";
import MinimalHeader from "@/components/UI/MinimalHeader";
import { useAppSelector } from "@/store/storeConfig";

import { useLocationSharingContext } from "./LocationContext";

export default function LocationSharingScreen() {
  const router = useRouter();
  const { route, bus } = useAppSelector((state) => state.auth);
  const { isSharingLocation, lastLocationText, locationMessage, handleLocationToggle } = useLocationSharingContext();

  useEffect(() => {
    if (!route || !bus) {
      router.replace("/home/setup");
    }
  }, [bus, route, router]);

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
          <View style={styles.radarContainer}>
            <View style={[styles.radarCircle, styles.outerCircle, isSharingLocation && styles.pulseActiveOuter]}>
              <View style={[styles.radarCircle, styles.midCircle, isSharingLocation && styles.pulseActiveMid]}>
                <View style={[styles.radarCircle, styles.innerCircle, isSharingLocation && styles.pulseActiveInner]}>
                  <MaterialCommunityIcons
                    name={isSharingLocation ? "map-marker-radius" : "map-marker-outline"}
                    size={48}
                    color={isSharingLocation ? "#111827" : "#9ca3af"}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIndicator, isSharingLocation ? styles.bgActive : styles.bgInactive]} />
              <Text style={styles.statusTitle}>
                {isSharingLocation ? "Broadcasting Live Location" : "Location Sharing Paused"}
              </Text>
            </View>

            <Text style={styles.statusDescription}>
              {isSharingLocation
                ? "Current coordinates are being sent to the server for live passenger updates."
                : "Enable location sharing to broadcast this vehicle position on the live map."}
            </Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#9ca3af" />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>GPS Coordinates</Text>
                <Text style={styles.infoValue}>{lastLocationText}</Text>
              </View>
            </View>

            {locationMessage ? <Text style={styles.inlineMessage}>{locationMessage}</Text> : null}
          </View>

          <TouchableOpacity
            onPress={() => handleLocationToggle(route._id, bus)}
            style={[styles.toggleBtn, isSharingLocation ? styles.btnStop : styles.btnStart]}
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
    backgroundColor: "#ffffff",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
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
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  midCircle: {
    width: 160,
    height: 160,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  innerCircle: {
    width: 100,
    height: 100,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  pulseActiveOuter: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
  },
  pulseActiveMid: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  pulseActiveInner: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d5db",
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    backgroundColor: "#111827",
  },
  bgInactive: {
    backgroundColor: "#9ca3af",
  },
  statusTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  statusDescription: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
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
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  inlineMessage: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 18,
  },
  toggleBtn: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  btnStart: {
    backgroundColor: "#111827",
  },
  btnStop: {
    backgroundColor: "#1f2937",
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
