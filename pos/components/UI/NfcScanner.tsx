import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ScanState, PaymentResponse } from "../../app/home/types";

interface NfcScannerProps {
  scanState: ScanState;
  scanError: string | null;
  lastTransaction: PaymentResponse | null;
  onScanCard: () => void;
  onReset: () => void;
}

export default function NfcScanner({
  scanState,
  scanError,
  lastTransaction,
  onScanCard,
  onReset,
}: NfcScannerProps) {
  return (
    <View style={styles.fullScreenNfcArea}>
      {scanState === "idle" && (
        <View style={styles.centeredStateContent}>
          <View style={[styles.bigIconContainer, styles.idleColor]}>
            <MaterialCommunityIcons name="contactless-payment" size={80} color="#10b981" />
          </View>
          <Text style={styles.stateTitle}>Ready to Collect Fare</Text>
          <Text style={styles.stateSubtitle}>Tap passenger NFC smart card to complete checkout.</Text>
          
          <TouchableOpacity onPress={onScanCard} style={[styles.giantScanBtn, styles.giantScanBtnIdle]}>
            <Text style={styles.giantScanBtnText}>Tap Card Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {scanState === "scanning" && (
        <View style={styles.centeredStateContent}>
          <View style={[styles.bigIconContainer, styles.scanningColor]}>
            <ActivityIndicator size={80} color="#6366f1" />
          </View>
          <Text style={styles.stateTitle}>Scanning NFC Card</Text>
          <Text style={styles.stateSubtitle}>Place passenger card close to the back of the device.</Text>
        </View>
      )}

      {scanState === "processing" && (
        <View style={styles.centeredStateContent}>
          <View style={[styles.bigIconContainer, styles.processingColor]}>
            <ActivityIndicator size="large" color="#e2e8f0" />
          </View>
          <Text style={styles.stateTitle}>Processing Payment</Text>
          <Text style={styles.stateSubtitle}>Connecting with Transnova servers, please wait...</Text>
        </View>
      )}

      {scanState === "success" && (
        <View style={[styles.fullScreenStatusCard, styles.successBackground]}>
          <Ionicons name="checkmark-circle" size={120} color="white" />
          <Text style={styles.fullScreenStatusTitle}>Payment Successful</Text>
          
          <View style={styles.successDetailsCard}>
            <Text style={styles.detailLabel}>Passenger</Text>
            <Text style={styles.detailValBig}>{lastTransaction?.data?.userName || "Anonymous Passenger"}</Text>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Fare Deducted</Text>
                <Text style={styles.detailValBold}>
                  {typeof lastTransaction?.data?.fare === "number" ? `${lastTransaction.data.fare} BDT` : "-- BDT"}
                </Text>
              </View>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel}>Remaining Balance</Text>
                <Text style={styles.detailValBold}>
                  {typeof lastTransaction?.data?.balance === "number" ? `${lastTransaction.data.balance} BDT` : "-- BDT"}
                </Text>
              </View>
            </View>

            <View style={styles.detailDivider} />

            <Text style={styles.detailLabel}>Trip Segment</Text>
            <Text style={styles.detailValSmall}>
              {lastTransaction?.data?.startStopage || "Origin"}
              {lastTransaction?.data?.endStopage ? ` → ${lastTransaction.data.endStopage}` : " (Check-In Only)"}
            </Text>
          </View>

          <TouchableOpacity onPress={onReset} style={styles.nextPassengerBtn}>
            <Text style={styles.nextPassengerBtnText}>Next Passenger</Text>
          </TouchableOpacity>
        </View>
      )}

      {scanState === "error" && (
        <View style={[styles.fullScreenStatusCard, styles.errorBackground]}>
          <Ionicons name="alert-circle" size={120} color="white" />
          <Text style={styles.fullScreenStatusTitle}>Transaction Failed</Text>
          
          <View style={styles.errorDetailsCard}>
            <Text style={styles.errorTextLabel}>Error Details</Text>
            <Text style={styles.errorTextValue}>{scanError || "An unexpected network error occurred."}</Text>
          </View>

          <TouchableOpacity onPress={onScanCard} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onReset} style={styles.cancelErrorBtn}>
            <Text style={styles.cancelErrorBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenNfcArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090d16",
    width: "100%",
  },
  centeredStateContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    width: "100%",
  },
  bigIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  idleColor: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  scanningColor: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
  },
  processingColor: {
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 12,
  },
  stateSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  giantScanBtn: {
    width: "100%",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  giantScanBtnIdle: {
    backgroundColor: "#10b981",
  },
  giantScanBtnText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  fullScreenStatusCard: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successBackground: {
    backgroundColor: "#065f46",
  },
  errorBackground: {
    backgroundColor: "#991b1b",
  },
  fullScreenStatusTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  successDetailsCard: {
    backgroundColor: "rgba(2, 6, 23, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    marginBottom: 40,
  },
  detailLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValBig: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  detailValBold: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  detailValSmall: {
    color: "#f1f5f9",
    fontSize: 15,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailCol: {
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 16,
  },
  nextPassengerBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  nextPassengerBtnText: {
    color: "#065f46",
    fontSize: 16,
    fontWeight: "700",
  },
  errorDetailsCard: {
    backgroundColor: "rgba(2, 6, 23, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    marginBottom: 40,
    alignItems: "center",
  },
  errorTextLabel: {
    color: "#f87171",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  errorTextValue: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingVertical: 18,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  retryBtnText: {
    color: "#991b1b",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelErrorBtn: {
    paddingVertical: 12,
  },
  cancelErrorBtnText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
  },
});
