import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { colors } from "@/config/colors";
import { useLoginMutation } from "@/store/features/auth/authApi";
import { setCredentials } from "@/store/features/auth/authSlice";
import { useAppDispatch } from "@/store/storeConfig";
import { fetchPosAssignment } from "@/utils/posAssignment";
import { ToastUtil } from "@/utils/toastUtil";

const getErrorMessage = (error: any) => {
  return (
    error?.data?.errorMessages?.[0]?.message ||
    error?.data?.message ||
    error?.response?.data?.errorMessages?.[0]?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Login failed."
  );
};

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !pin.trim()) {
      const message = "Enter your phone number and PIN.";
      setErrorMessage(message);
      ToastUtil.error(message);
      return;
    }

    setErrorMessage("");

    try {
      const result = await login({
        phoneNumber: phoneNumber.trim(),
        pin: pin.trim(),
        role: "pos_device",
      }).unwrap();
      const { accessToken, user } = (result as any).data || result;
      const assignment = await fetchPosAssignment(user?._id || user?.userId);

      if (!assignment.route || !assignment.bus) {
        throw new Error("No route or bus is assigned to this POS device.");
      }

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);

      dispatch(
        setCredentials({
          user,
          route: assignment.route,
          bus: assignment.bus,
          accessToken,
        }),
      );

      ToastUtil.success("POS device authenticated.");
      router.replace("/home");
    } catch (error: any) {
      const message = getErrorMessage(error);
      console.log("Login error:", JSON.stringify(error, null, 2));
      setErrorMessage(message);
      ToastUtil.error(message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="bus-marker" size={32} color="#ffffff" />
          </View>
          <Text style={styles.title}>Bus POS</Text>
          <Text style={styles.subtitle}>
            Secure operator login for fare collection and real-time bus location sharing.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="phone-outline" size={20} color={colors.muted[500]} />
              <TextInput
                value={phoneNumber}
                onChangeText={(value) => {
                  setPhoneNumber(value);
                  if (errorMessage) setErrorMessage("");
                }}
                autoCapitalize="none"
                keyboardType="phone-pad"
                placeholder="017XXXXXXXX"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                editable={!isLoading}
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>PIN Number</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock-outline" size={20} color={colors.muted[500]} />
              <TextInput
                value={pin}
                onChangeText={(value) => {
                  setPin(value);
                  if (errorMessage) setErrorMessage("");
                }}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                placeholder="Enter PIN"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPin((value) => !value)} disabled={isLoading}>
                <Ionicons name={showPin ? "eye-off" : "eye"} size={20} color={colors.muted[500]} />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={18} color="#b42318" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity onPress={handleLogin} disabled={isLoading} style={styles.loginButton}>
            {isLoading ? <LoadingIndicator color="white" /> : <Text style={styles.loginButtonText}>Login</Text>}
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "space-between",
    backgroundColor: "#f3f0ea",
  },
  heroSection: {
    marginTop: 40,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    color: "#1f2937",
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 16,
    marginTop: 12,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#faf7f2",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e7e0d6",
    shadowColor: "#7c6f64",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    color: "#475569",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd6cb",
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fffdf9",
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: "#0f172a",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fef3f2",
    borderWidth: 1,
    borderColor: "#fecdca",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    color: "#b42318",
    fontSize: 14,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: "#10b981",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
