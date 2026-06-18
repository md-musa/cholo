import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface MinimalHeaderProps {
  routeName?: string;
  routeNo?: string;
  busName?: string;
  isSharingLocation: boolean;
}

export default function MinimalHeader({ routeName, routeNo, busName, isSharingLocation }: MinimalHeaderProps) {
  return (
    <View style={styles.minimalHeader}>
      <View style={styles.minimalInfo}>
        <Text style={styles.minimalRouteText}>{`${routeNo}: ${routeName}`}</Text>
        <Text style={styles.minimalBusText}>{busName || "Not assigned"}</Text>
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
    borderBottomColor: "#e4ddd3",
    backgroundColor: "#f3f0ea",
  },
  minimalInfo: {
    flex: 1,
  },
  minimalRouteText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  minimalBusText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    textTransform: "capitalize",
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
    backgroundColor: "#f1ede7",
    borderWidth: 1,
    borderColor: "#d8d0c4",
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
    color: "#334155",
  },
});
