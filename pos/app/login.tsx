import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { useLoginMutation } from "@/store/features/auth/authApi";
import { setCredentials } from "@/store/features/auth/authSlice";
import { useAppDispatch } from "@/store/storeConfig";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !pin.trim()) {
      setMessage("Enter your phone number and PIN.");
      return;
    }

    try {
      setMessage(null);
      const result = await login({
        phoneNumber: phoneNumber.trim(),
        pin: pin.trim(),
        role: "pos_device",
      }).unwrap();
      const { accessToken, user } = (result as any).data || result;

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);

      dispatch(
        setCredentials({
          user,
          route: null,
          bus: null,
          accessToken,
        }),
      );

      router.replace("/home");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || error?.data?.message || error?.message || "Login failed.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="bus-marker" size={28} color="#111827" />
          </View>
          <Text style={styles.eyebrow}>Transnova POS</Text>
          <Text style={styles.title}>Operator login</Text>
          <Text style={styles.subtitle}>Sign in to start fare collection and live vehicle tracking.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="phone-outline" size={20} color="#9ca3af" />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                autoCapitalize="none"
                keyboardType="phone-pad"
                placeholder="017XXXXXXXX"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                editable={!isLoading}
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>PIN Number</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock-outline" size={20} color="#9ca3af" />
              <TextInput
                value={pin}
                onChangeText={setPin}
                secureTextEntry={!showPin}
                keyboardType="number-pad"
                placeholder="Enter PIN"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPin((value) => !value)} disabled={isLoading}>
                <Ionicons name={showPin ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {message ? <Text style={styles.inlineMessage}>{message}</Text> : null}

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
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "space-between",
  },
  heroSection: {
    marginTop: 40,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  eyebrow: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "700",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: 15,
    marginTop: 12,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    marginBottom: 8,
    fontWeight: "600",
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: "#fcfcfc",
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: "#111827",
  },
  inlineMessage: {
    marginTop: 16,
    color: "#b91c1c",
    fontSize: 13,
    lineHeight: 18,
  },
  loginButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 24,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});
