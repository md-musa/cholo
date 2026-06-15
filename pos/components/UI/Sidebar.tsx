import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(width * 0.8, 320);

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  routeId: string | null;
  routes: any[];
  onRouteChange: (id: string | null) => void;
  busId: string | null;
  buses: any[];
  onBusChange: (id: string | null) => void;
  isSharingLocation: boolean;
  lastLocationText: string;
  isStartingTrip: boolean;
  onLocationToggle: () => void;
  activeTripId: string | null;
  onLogout: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  user,
  routeId,
  routes,
  onRouteChange,
  busId,
  buses,
  onBusChange,
  isSharingLocation,
  lastLocationText,
  isStartingTrip,
  onLocationToggle,
  activeTripId,
  onLogout,
}: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const selectedRouteObj = routes.find((r) => r._id === routeId);
  const selectedBusObj = buses.find((b) => b._id === busId);

  return (
    <Modal transparent visible={isOpen} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Semi-transparent Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Slide-out Panel */}
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.topContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings & Console</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Profile Section */}
            <View style={styles.section}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={20} color="white" />
                </View>
                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{user?.name || "POS Operator"}</Text>
                  <Text style={styles.profileEmail}>{user?.email || "operator@transnova.com"}</Text>
                </View>
              </View>
            </View>

            {/* Location Sharing Card */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Live Location Sharing</Text>
              <View style={[styles.locationCard, isSharingLocation ? styles.activeLoc : styles.inactiveLoc]}>
                <View style={styles.locationInfo}>
                  <View style={styles.rowCenter}>
                    <View style={[styles.statusDot, isSharingLocation ? styles.dotActive : styles.dotInactive]} />
                    <Text style={styles.locationStatus}>
                      {isSharingLocation ? "Broadcasting Location" : "Location Inactive"}
                    </Text>
                  </View>
                  <Text style={styles.locationDetails}>{lastLocationText}</Text>
                  {activeTripId && (
                    <Text style={styles.tripIdText}>Trip ID: {activeTripId.substring(0, 10)}...</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onLocationToggle}
                  disabled={isStartingTrip}
                  style={[styles.actionBtn, isSharingLocation ? styles.btnDanger : styles.btnSuccess]}
                >
                  {isStartingTrip ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.actionBtnText}>{isSharingLocation ? "Stop Sharing" : "Start Sharing"}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Setup / Config Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Assignment</Text>

              <Text style={styles.pickerLabel}>Route</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={routeId} onValueChange={onRouteChange} style={styles.picker} dropdownIconColor="#f8fafc">
                  <Picker.Item label="Select route" value={null} style={styles.pickerItem} />
                  {routes.map((route: any) => (
                    <Picker.Item
                      key={route._id}
                      label={route.routeNo ? `${route.routeNo} - ${route.routeName}` : route.routeName}
                      value={route._id}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>Bus</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={busId} onValueChange={onBusChange} style={styles.picker} dropdownIconColor="#f8fafc">
                  <Picker.Item label="Select bus" value={null} style={styles.pickerItem} />
                  {buses.map((bus: any) => (
                    <Picker.Item
                      key={bus._id}
                      label={bus.name}
                      value={bus._id}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.7)",
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: "100%",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
    paddingTop: 50,
    justifyContent: "space-between",
    borderRightWidth: 1,
    borderRightColor: "#1e293b",
  },
  topContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 12,
    borderRadius: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
  profileEmail: {
    color: "#64748b",
    fontSize: 12,
  },
  locationCard: {
    borderRadius: 16,
    padding: 16,
  },
  activeLoc: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  inactiveLoc: {
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
  },
  locationInfo: {
    marginBottom: 12,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: "#10b981",
  },
  dotInactive: {
    backgroundColor: "#64748b",
  },
  locationStatus: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
  locationDetails: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  tripIdText: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
  },
  actionBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSuccess: {
    backgroundColor: "#10b981",
  },
  btnDanger: {
    backgroundColor: "#ef4444",
  },
  actionBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  pickerLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6,
  },
  pickerContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  picker: {
    color: "#f8fafc",
    backgroundColor: "transparent",
  },
  pickerItem: {
    fontSize: 14,
    color: "#f8fafc",
    backgroundColor: "#1e293b",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingVertical: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  logoutText: {
    color: "#f43f5e",
    fontWeight: "600",
    fontSize: 15,
    marginLeft: 8,
  },
});
