import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MinimalHeaderProps {
  routeName?: string;
  routeNo?: string;
  busName?: string;
  isSharingLocation: boolean;
}

export default function MinimalHeader({
  routeName,
  routeNo,
  busName,
  isSharingLocation,
}: MinimalHeaderProps) {
  return (
    <View style={styles.minimalHeader}>
      <View style={styles.minimalInfo}>
        <Text style={styles.minimalRouteText}>{routeNo ? `Route ${routeNo}` : routeName || "Route"}</Text>
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
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  minimalInfo: {
    flex: 1,
  },
  minimalRouteText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  minimalBusText: {
    fontSize: 12,
    color: "#6b7280",
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
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badgeInactive: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotActive: {
    backgroundColor: "#111827",
  },
  dotInactive: {
    backgroundColor: "#9ca3af",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
});
