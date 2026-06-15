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
import { ToastUtil } from "@/utils/toastUtil";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      ToastUtil.error("Enter your email and password.");
      return;
    }

    try {
      const result = await login({ email: email.trim(), password }).unwrap();
      const { accessToken, user } = (result as any).data || result;

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);

      dispatch(
        setCredentials({
          user,
          route: null,
          accessToken,
        }),
      );

      ToastUtil.success("POS device authenticated.");
      router.replace("/home");
    } catch (error: any) {
      console.log(error);
      console.log("Login error:", JSON.stringify(error, null, 2));
      ToastUtil.error(error?.response?.data?.message || error?.data?.message || "Login failed.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="bus-marker" size={32} color="white" />
          </View>
          <Text style={styles.title}>Bus POS</Text>
          <Text style={styles.subtitle}>
            Secure operator login for fare collection and real-time bus location sharing.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted[500]} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="operator@company.com"
                style={styles.input}
                editable={!isLoading}
              />
            </View>
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="lock-outline" size={20} color={colors.muted[500]} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Enter password"
                style={styles.input}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword((value) => !value)} disabled={isLoading}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.muted[500]} />
              </TouchableOpacity>
            </View>
          </View>

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
    backgroundColor: "#020617",
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
    borderRadius: 16,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "700",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 16,
    marginTop: 12,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    color: "#334155",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: "#0f172a",
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
