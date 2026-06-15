import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MinimalHeaderProps {
  onMenuPress: () => void;
  routeName?: string;
  routeNo?: string;
  busName?: string;
  isSharingLocation: boolean;
}

export default function MinimalHeader({
  onMenuPress,
  routeName,
  routeNo,
  busName,
  isSharingLocation,
}: MinimalHeaderProps) {
  return (
    <View style={styles.minimalHeader}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="menu-outline" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.minimalInfo}>
        <Text style={styles.minimalRouteText}>
          {routeNo ? `Route ${routeNo}` : routeName || "Route"}
        </Text>
        <Text style={styles.minimalBusText}>{busName || "Bus"}</Text>
      </View>

      <View style={styles.statusBadges}>
        {isSharingLocation ? (
          <View style={[styles.badge, styles.badgeSuccess]}>
            <View style={[styles.badgeDot, styles.dotActive]} />
            <Text style={styles.badgeText}>LIVE</Text>
          </View>
        ) : (
          <View style={[styles.badge, styles.badgeInactive]}>
            <View style={[styles.badgeDot, styles.dotInactive]} />
            <Text style={styles.badgeText}>OFFLINE</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  minimalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "#020617",
  },
  menuButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: "#1e293b",
  },
  minimalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  minimalRouteText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  minimalBusText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  statusBadges: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  badgeInactive: {
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.3)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: "#10b981",
  },
  dotInactive: {
    backgroundColor: "#94a3b8",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f8fafc",
  },
});
