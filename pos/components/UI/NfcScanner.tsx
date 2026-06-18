import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { ScanState, PaymentResponse } from "../../app/home/types";

interface NfcScannerProps {
  scanState: ScanState;
  scanError: string | null;
  lastTransaction: PaymentResponse | null;
  isNfcAvailable: boolean;
  onTestScan: () => void;
}

const formatMoney = (value?: number) => (typeof value === "number" ? `৳${value}` : "৳0");
const formatDistance = (value?: number) => (typeof value === "number" ? `${value.toFixed(2)} km` : "-- km");

export default function NfcScanner({
  scanState,
  scanError,
  lastTransaction,
  isNfcAvailable,
  onTestScan,
}: NfcScannerProps) {
  const isCheckIn = lastTransaction?.message === "Check-in successful";
  const passengerName = lastTransaction?.data?.name || lastTransaction?.data?.userName || "Passenger";

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.indicatorRow}>
          <View style={[styles.indicatorDot, scanState === "processing" ? styles.dotBusy : styles.dotReady]} />
          <Text style={styles.indicatorText}>
            {scanState === "processing"
              ? "Processing card"
              : isNfcAvailable
                ? "Ready to scan"
                : "NFC unavailable"}
          </Text>
        </View>

        <View style={styles.iconShell}>
          <View style={styles.iconRing}>
            <MaterialCommunityIcons
              name="contactless-payment"
              size={72}
              color={scanState === "processing" ? "#111827" : "#6b7280"}
            />
          </View>
        </View>

        <Text style={styles.title}>Tap card near the device</Text>
        <Text style={styles.subtitle}>
          Keep the terminal open. New taps are read continuously and sent to the server immediately.
        </Text>

        {scanState === "processing" ? (
          <View style={styles.processingRow}>
            <ActivityIndicator size="small" color="#111827" />
            <Text style={styles.processingText}>Contacting server...</Text>
          </View>
        ) : null}

        {scanError ? (
          <View style={styles.inlineMessage}>
            <Ionicons name="alert-circle-outline" size={18} color="#b91c1c" />
            <Text style={styles.inlineErrorText}>{scanError}</Text>
          </View>
        ) : (
          <View style={styles.inlineHint}>
            <Text style={styles.inlineHintText}>
              {isNfcAvailable ? "Ready to scan" : "Enable NFC to start scanning"}
            </Text>
          </View>
        )}
      </View>

      {scanState === "success" && lastTransaction ? (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={22} color="#111827" />
            <Text style={styles.resultTitle}>
              {isCheckIn ? "Check-in successful" : "Check-out successful"}
            </Text>
          </View>

          {isCheckIn ? (
            <>
              <Text style={styles.resultName}>{passengerName}</Text>
              <Text style={styles.resultSubtitle}>Passenger checked in successfully.</Text>
            </>
          ) : (
            <View style={styles.checkoutGrid}>
              <View style={styles.checkoutRow}>
                <Text style={styles.metricLabel}>Name</Text>
                <Text style={styles.metricValue}>{passengerName}</Text>
              </View>
              <View style={styles.checkoutRow}>
                <Text style={styles.metricLabel}>Distance traveled</Text>
                <Text style={styles.metricValue}>{formatDistance(lastTransaction.data?.distanceInKm)}</Text>
              </View>
              <View style={styles.checkoutRow}>
                <Text style={styles.metricLabel}>Fare</Text>
                <Text style={styles.metricValue}>{formatMoney(lastTransaction.data?.fareDeducted)}</Text>
              </View>
              <View style={styles.checkoutRow}>
                <Text style={styles.metricLabel}>Remaining balance</Text>
                <Text style={styles.metricValue}>{formatMoney(lastTransaction.data?.remainingBalance)}</Text>
              </View>
            </View>
          )}
        </View>
      ) : null}

      <TouchableOpacity onPress={onTestScan} style={styles.testButton}>
        <Text style={styles.testButtonText}>Test NFC</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 28,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  indicatorRow: {
    position: "absolute",
    top: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotReady: {
    backgroundColor: "#16a34a",
  },
  dotBusy: {
    backgroundColor: "#111827",
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  iconShell: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    backgroundColor: "#fcfcfc",
  },
  iconRing: {
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 360,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 10,
  },
  processingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  inlineHint: {
    marginTop: 28,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f9fafb",
  },
  inlineHintText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "500",
  },
  inlineMessage: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
  },
  inlineErrorText: {
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
  resultCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  resultName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  checkoutGrid: {
    gap: 14,
  },
  checkoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  metricLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  metricValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  testButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
