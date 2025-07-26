import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axiosInstance from "@/config/axiosInstance";
import LoadingScreen from "@/components/UI/LoadingScreen";

export default function PaymentHistory() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPaymentHistory = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/payments/payment-history", {
        params: { busId: "685c430465f521c175a4ca79" },
      });
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#10B981";
      case "failed":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <View style={styles.container} className="flex-1 bg-gray-200">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />}
      >
        {history.map((item) => {
          const isCompleted = !!item.endStopage;

          return (
            <View key={item._id} style={styles.card} className="border border-gray-200 shadow-md">
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} className="text-lg font-semibold">
                  {item.startStopage.toUpperCase()}
                  {isCompleted ? ` to ${item.endStopage.toUpperCase()}` : " (Pending)"}
                </Text>
                <Text style={[styles.status, { color: getStatusColor(item.paymentStatus) }]}>
                  {item.paymentStatus.toUpperCase()}
                </Text>
              </View>

              {/* Fare - only show if payment is completed */}
              {isCompleted && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Fare:</Text>
                  <Text>{item.fare} BDT</Text>
                </View>
              )}

              {/* Distance - only show if payment is completed */}
              {isCompleted && item.distanceInKm && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Distance:</Text>
                  <Text>{parseFloat(item.distanceInKm).toFixed(2)} km</Text>
                </View>
              )}

              {/* Time - show both checkin and checkout if available */}
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Time:</Text>
                <Text className="text-sm">
                  {formatDate(item.checkinTime)}
                  {item.checkoutTime &&
                    ` → ${new Date(item.checkoutTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}`}
                </Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>NFC ID:</Text>
                <Text>{item.nfcUid}</Text>
              </View>

              {/* Show pending status if not completed */}
              {!isCompleted && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>JOURNEY IN PROGRESS</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      {/* create a refresh button for history */}
    </View>
  );
}

const styles = StyleSheet.create({
  pendingBadge: {
    marginTop: 8,
    padding: 4,
    backgroundColor: "#FEF3C7", // amber-100
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  pendingText: {
    color: "#92400E", // amber-800
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
  },
  status: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardLabel: {
    fontWeight: "500",
    color: "#6B7280",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
    color: "#111827",
  },
  table: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
  },
  headerCell: {
    color: "white",
    fontWeight: "600",
    paddingHorizontal: 8,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  evenRow: {
    backgroundColor: "#FFFFFF",
  },
  oddRow: {
    backgroundColor: "#F9FAFB",
  },
  cell: {
    paddingHorizontal: 8,
    textAlign: "center",
    color: "#374151",
  },
});
