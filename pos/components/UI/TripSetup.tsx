import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface TripSetupProps {
  routeId: string | null;
  routes: any[];
  onRouteChange: (id: string | null) => void;
  busId: string | null;
  buses: any[];
  onBusChange: (id: string | null) => void;
  onSubmit: () => void;
}

export default function TripSetup({
  routeId,
  routes,
  onRouteChange,
  busId,
  buses,
  onBusChange,
  onSubmit,
}: TripSetupProps) {
  return (
    <ScrollView contentContainerStyle={styles.setupContainer}>
      <View style={styles.setupHeader}>
        <View style={styles.setupLogo}>
          <MaterialCommunityIcons name="bus-marker" size={40} color="white" />
        </View>
        <Text style={styles.setupTitle}>Terminal Setup Required</Text>
        <Text style={styles.setupSubtitle}>
          Please select the active route and bus before enabling card fare collection.
        </Text>
      </View>

      <View style={styles.setupCard}>
        <Text style={styles.setupCardTitle}>Configure Terminal</Text>
        
        <Text style={styles.inputLabel}>Select Active Route</Text>
        <View style={[styles.pickerWrap, styles.spacing]}>
          <Picker selectedValue={routeId} onValueChange={onRouteChange} dropdownIconColor="#0f172a">
            <Picker.Item label="Choose active route..." value={null} />
            {routes.map((route: any) => (
              <Picker.Item
                key={route._id}
                label={route.routeNo ? `${route.routeNo} - ${route.routeName}` : route.routeName}
                value={route._id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Select Assigned Bus</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={busId} onValueChange={onBusChange} dropdownIconColor="#0f172a">
            <Picker.Item label="Choose active bus..." value={null} />
            {buses.map((bus: any) => (
              <Picker.Item key={bus._id} label={bus.name} value={bus._id} />
            ))}
          </Picker>
        </View>

        {routeId && busId && (
          <TouchableOpacity
            style={styles.setupSubmitBtn}
            onPress={onSubmit}
          >
            <Text style={styles.setupSubmitBtnText}>Initialize Terminal</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    padding: 24,
    paddingTop: 60,
    justifyContent: "center",
  },
  setupHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  setupLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  setupTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  setupSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  setupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
  },
  setupCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 20,
  },
  inputLabel: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
  },
  spacing: {
    marginBottom: 20,
  },
  setupSubmitBtn: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  setupSubmitBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
