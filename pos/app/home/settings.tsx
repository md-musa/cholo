import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ASYNC_STORAGE_KEYS } from "@/constants";
import { clearCredentials } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";

import { useLocationSharingContext } from "./LocationContext";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stopForegroundLocationSharing } = useLocationSharingContext();
  const [message, setMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      stopForegroundLocationSharing();

      await AsyncStorage.multiRemove([
        ASYNC_STORAGE_KEYS.AUTH_TOKEN,
        ASYNC_STORAGE_KEYS.CURRENT_ROUTE,
        "current_bus",
      ]);

      dispatch(clearCredentials());
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
      setMessage("Failed to log out cleanly.");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "OP";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatRole = (role?: string) => {
    if (!role) return "Operator";
    return role
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage the active POS device session.</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formatRole(user?.role)}</Text>
            </View>
          </View>

          <Text style={styles.profileName}>{user?.name || "POS Operator"}</Text>
          <Text style={styles.profileEmail}>{user?.email || "operator@transnova.com"}</Text>
        </View>

        <View style={styles.consoleCard}>
          <Text style={styles.consoleCardTitle}>Terminal Info</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Status</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Online</Text>
            </View>
          </View>

          {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="white" />
          <Text style={styles.logoutButtonText}>Log Out Console</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  headerTitle: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 6,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#f3f4f6",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: -12,
  },
  badgeText: {
    color: "#111827",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  profileName: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  profileEmail: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  consoleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 24,
    width: "100%",
    flex: 1,
    marginVertical: 24,
  },
  consoleCardTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  activeBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },
  inlineMessage: {
    marginTop: 16,
    color: "#b91c1c",
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
