import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { ScanState, PaymentResponse } from "../../contexts/types";

interface NfcScannerProps {
  nfcSupported: boolean;
  scanState: ScanState;
  scanError: string | null;
  lastTransaction: PaymentResponse | null;
  onDemoScan: () => void;
}

export default function NfcScanner({
  nfcSupported,
  scanState,
  scanError,
  lastTransaction,
  onDemoScan,
}: NfcScannerProps) {
  const isCheckout = lastTransaction?.message?.toLowerCase().includes("check-out");
  const isCheckin = lastTransaction?.message?.toLowerCase().includes("check-in");

  return (
    <View style={styles.container}>
      {(scanState === "idle" || scanState === "scanning") && (
        <View style={styles.centeredContent}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="contactless-payment" size={80} color="#10b981" />
          </View>
          <Text style={styles.title}>Ready to Scan</Text>
          <Text style={styles.subtitle}>
            {nfcSupported
              ? "Hold the card near the device. Reading stays on continuously."
              : "NFC is not supported on this device. Use the demo button to test."}
          </Text>
        </View>
      )}

      {scanState === "processing" && (
        <View style={[styles.centeredContent, styles.fullScreenCard, styles.loadingCard]}>
          <View style={styles.iconWrap}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
          <Text style={styles.fullScreenTitle}>Processing</Text>
          <Text style={styles.fullScreenSubtitle}>Please wait for a while</Text>
        </View>
      )}

      {scanState === "success" && (
        <View style={[styles.centeredContent, styles.fullScreenCard, styles.successCard]}>
          <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          <Text style={styles.fullScreenTitle}>
            {isCheckout
              ? "Check-Out Successful"
              : isCheckin
                ? "Check-In Successful"
                : lastTransaction?.message || "Success"}
          </Text>
          {/* <Text style={styles.fullScreenSubtitle}>{lastTransaction?.message || "Transaction completed."}</Text> */}

          <View style={styles.detailsWrap}>
            {isCheckout ? (
              <>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>
                    {typeof lastTransaction?.data?.distanceInKm === "number"
                      ? `${lastTransaction.data.distanceInKm.toFixed(2)} km`
                      : "--"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Fare</Text>
                  <Text style={styles.detailValue}>
                    {typeof lastTransaction?.data?.fareDeducted === "number"
                      ? `${lastTransaction.data.fareDeducted} BDT`
                      : "--"}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Remaining Balance</Text>
                  <Text style={styles.detailValue}>
                    {typeof lastTransaction?.data?.remainingBalance === "number"
                      ? `${lastTransaction.data.remainingBalance} BDT`
                      : "--"}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Balance</Text>
                <Text style={styles.detailValue}>
                  {typeof lastTransaction?.data?.balance === "number" ? `${lastTransaction.data.balance} BDT` : "--"}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {scanState === "error" && (
        <View style={[styles.centeredContent, styles.fullScreenCard, styles.errorCard]}>
          <Ionicons name="alert-circle" size={64} color="#b42318" />
          <Text style={styles.fullScreenTitle}>Transaction Failed</Text>
          <Text style={styles.errorText}>{scanError || "An unexpected network error occurred."}</Text>
        </View>
      )}

      {!nfcSupported && (
        <TouchableOpacity onPress={onDemoScan} style={styles.demoButton}>
          <Ionicons name="flask-outline" size={18} color="#ffffff" />
          <Text style={styles.demoButtonText}>Demo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f0ea",
  },
  centeredContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  fullScreenCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 32,
  },
  loadingCard: {
    backgroundColor: "#f3f0ea",
  },
  iconWrap: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#ddd6cb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
    textAlign: "center",
    maxWidth: 280,
  },
  successCard: {
    backgroundColor: "#f3f0ea",
  },
  errorCard: {
    backgroundColor: "#fff5f4",
  },
  fullScreenTitle: {
    color: "#1f2937",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  fullScreenSubtitle: {
    color: "#6b7280",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 340,
  },
  errorText: {
    color: "#b42318",
    fontSize: 20,
    lineHeight: 30,
    marginTop: 12,
    textAlign: "center",
    maxWidth: 340,
  },
  detailsWrap: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
  },
  detailItem: {
    width: "100%",
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#ddd6cb",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 12,
  },
  detailLabel: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  detailValue: {
    color: "#1f2937",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  demoButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#7c6f64",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 4,
  },
  demoButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
});
