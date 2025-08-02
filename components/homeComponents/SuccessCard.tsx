import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ResultData {
  message: string;
  data: {
    startStopage: string;
    endStopage?: string;
    fare: number;
    distanceInKm?: number;
    userName: string;
  };
}

interface SuccessCardProps {
  result: ResultData;
  status: string;
}

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const SuccessCard: React.FC<SuccessCardProps> = ({ result, status }) => {
  if (status !== "success") return null;

  return (
    <View style={styles.card}>
      <Text style={styles.successMessage}>{result?.message}</Text>

      <View style={styles.sectionContainer}>
        {/* Stopage */}
        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="map-marker-path" size={18} color="#6B7280" />
            <Text style={styles.labelText}>Stopage:</Text>
          </View>

          <View style={styles.valueRow}>
            <Text style={styles.valueText}>{capitalize(result.data.startStopage)}</Text>
            {result.data.endStopage && (
              <>
                <MaterialCommunityIcons name="arrow-right-bold" size={18} color="#6B7280" />
                <Text style={styles.valueText}>{capitalize(result.data.endStopage)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Fare */}
        {result.data.fare >= 0 && (
          <View style={styles.infoRow}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="cash" size={18} color="#6B7280" />
              <Text style={styles.labelText}>Fare:</Text>
            </View>
            <Text style={styles.valueText}>{result.data.fare} TK</Text>
          </View>
        )}

        {/* Distance */}
        {result.data.distanceInKm && (
          <View style={styles.infoRow}>
            <View style={styles.labelRow}>
              <MaterialCommunityIcons name="map-marker-distance" size={18} color="#6B7280" />
              <Text style={styles.labelText}>Distance:</Text>
            </View>
            <Text style={styles.valueText}>{result.data.distanceInKm.toFixed(2)} Km</Text>
          </View>
        )}

        {/* Passenger */}
        <View style={styles.infoRow}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="account" size={18} color="#6B7280" />
            <Text style={styles.labelText}>Passenger:</Text>
          </View>
          <Text style={styles.valueText}>{capitalize(result.data.userName)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  successMessage: {
    fontSize: 20,
    fontWeight: "600",
    color: "#008068",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionContainer: {
    gap: 3,
  },
  infoRow: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 2,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelText: {
    fontSize: 12,
    color: "#6B7280",
  },
  valueText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
});

export default SuccessCard;
