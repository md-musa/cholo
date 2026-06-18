import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { ASYNC_STORAGE_KEYS } from "@/constants";
import { clearCredentials } from "@/store/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { useLocationSharingContext } from "./LocationContext";
import { ToastUtil } from "@/utils/toastUtil";

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stopForegroundLocationSharing } = useLocationSharingContext();

  const handleLogout = async () => {
    try {
      // Stop location sharing if active
      stopForegroundLocationSharing();

      // Clear storage
      await AsyncStorage.multiRemove([
        ASYNC_STORAGE_KEYS.AUTH_TOKEN,
        ASYNC_STORAGE_KEYS.CURRENT_ROUTE,
        "current_bus",
      ]);

      // Clear redux
      dispatch(clearCredentials());

      ToastUtil.success("Logged out successfully.");
      router.replace("/login");
    } catch (err) {
      console.log("Logout error:", err);
      ToastUtil.error("Failed to log out cleanly.");
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "OP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatRole = (role?: string) => {
    if (!role) return "Operator";
    return role
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Title Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Operator Settings</Text>
          <Text style={styles.headerSubtitle}>Manage terminal console & operator profile</Text>
        </View>

        {/* Profile Card */}
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

        {/* Console Config Stats */}
        <View style={styles.consoleCard}>
          <Text style={styles.consoleCardTitle}>Terminal Info</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statLabel}>Status</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Online</Text>
            </View>
          </View>
        </View>

        {/* Log Out Action */}
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
    backgroundColor: "#f3f0ea",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    backgroundColor: "#f3f0ea",
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
  },
  headerTitle: {
    color: "#1f2937",
    fontSize: 28,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 6,
  },
  profileCard: {
    backgroundColor: "#faf7f2",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e7e0d6",
    padding: 32,
    alignItems: "center",
    width: "100%",
  },
  avatarContainer: {
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#f3f0ea",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: -12,
  },
  badgeText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  profileName: {
    color: "#1f2937",
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
    backgroundColor: "#faf7f2",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e7e0d6",
    padding: 24,
    width: "100%",
    flex: 1,
    marginVertical: 24,
  },
  consoleCardTitle: {
    color: "#1f2937",
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
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  activeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    borderRadius: 20,
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
