import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
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
  message?: string | null;
}

export default function TripSetup({
  routeId,
  routes,
  onRouteChange,
  busId,
  buses,
  onBusChange,
  onSubmit,
  message,
}: TripSetupProps) {
  return (
    <ScrollView contentContainerStyle={styles.setupContainer}>
      <View style={styles.setupHeader}>
        <View style={styles.setupLogo}>
          <MaterialCommunityIcons name="bus-marker" size={32} color="#111827" />
        </View>
        <Text style={styles.setupEyebrow}>Transnova POS</Text>
        <Text style={styles.setupTitle}>Terminal setup</Text>
        <Text style={styles.setupSubtitle}>
          Select the active route and assigned bus before opening the scanner.
        </Text>
      </View>

      <View style={styles.setupCard}>
        <Text style={styles.setupCardTitle}>Configure terminal</Text>

        <Text style={styles.inputLabel}>Select Active Route</Text>
        <View style={[styles.pickerWrap, styles.spacing]}>
          <Picker selectedValue={routeId} onValueChange={onRouteChange} dropdownIconColor="#111827">
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
          <Picker selectedValue={busId} onValueChange={onBusChange} dropdownIconColor="#111827">
            <Picker.Item label="Choose active bus..." value={null} />
            {buses.map((bus: any) => (
              <Picker.Item key={bus._id} label={bus.name} value={bus._id} />
            ))}
          </Picker>
        </View>

        {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}

        {routeId && busId ? (
          <TouchableOpacity style={styles.setupSubmitBtn} onPress={onSubmit}>
            <Text style={styles.setupSubmitBtnText}>Open Scanner</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  setupContainer: {
    padding: 24,
    paddingTop: 60,
    justifyContent: "center",
    backgroundColor: "#ffffff",
    flexGrow: 1,
  },
  setupHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  setupLogo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  setupEyebrow: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  setupTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  setupSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  setupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  setupCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  inputLabel: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 8,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fcfcfc",
  },
  spacing: {
    marginBottom: 20,
  },
  inlineMessage: {
    marginTop: 16,
    color: "#b91c1c",
    fontSize: 13,
  },
  setupSubmitBtn: {
    backgroundColor: "#111827",
    borderRadius: 14,
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
