import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Link, useRouter } from "expo-router";
import { ToastUtil } from "@/utils/toastUtil";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { useLoginMutation } from "@/store/features/auth/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { useAppDispatch } from "@/store/storeConfig";
import { setCredentials } from "@/store/features/auth/authSlice";
import { colors } from "@/config/colors";

const Login = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async () => {
    try {
      const result = await login({ email, password }).unwrap();

      const { accessToken, user } = result;

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(user.routeId));

      dispatch(setCredentials({ user, route: user.routeId, accessToken }));
      ToastUtil.success(`Welcome, ${user.name}!`);
      router.replace("/home");
    } catch (err) {
      // console.log("🟥 Login Error", JSON.stringify(err, null, 2));
      ToastUtil.error(err?.response?.data.errorMessages[0].message || "Login error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-end px-10 mb-10">
        {/* Title and Caption (original version) */}
        <View className="">
          <Text className="text-title-2 font-semibold text-center mb-4">Track Your Campus Buses</Text>
          <Text className="text-body text-center text-muted-500 mb-10">
            Login to view real-time bus locations and schedules
          </Text>
        </View>

        {/* Form aligned to bottom */}
        <View className="">
          {/* Email Input */}
          <View className="my-5">
            <View className="flex-row items-center gap-2 my-1">
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">University Mail</Text>
            </View>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your university mail"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-muted-300 rounded-xl px-4 py-4"
            />
          </View>

          {/* Password Input with toggle */}
          <View className="my-3">
            <View className="flex-row items-center gap-2 my-1">
              <MaterialIcons name="password" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">Password</Text>
            </View>
            <View className="flex-row items-center border border-muted-300 rounded-xl px-4 py-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                className="flex-1"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="w-full bg-secondary-900 p-3 rounded-xl flex-row justify-center"
            >
              {isLoading ? (
                <LoadingIndicator color="white" />
              ) : (
                <Text className="text-body text-center text-white">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Forgot Password and Sign Up Links */}
          <View className="mt-4 items-center">
            <TouchableOpacity className="mb-4">
              <Text className="text-secondary-700">Forgot Password?</Text>
            </TouchableOpacity>
            <View className="flex-row">
              <Text className="text-muted-600">Don't have an account? </Text>
              <Link href="/register" className="text-secondary-700">
                Sign Up
              </Link>
            </View>
          </View>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default Login;
