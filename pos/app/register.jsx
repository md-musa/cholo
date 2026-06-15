import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Picker } from "@react-native-picker/picker";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { useRegisterMutation } from "@/store/features/auth/authApi";
import { useGetRoutesQuery } from "@/store/features/route/routeApi";
import { ASYNC_STORAGE_KEYS } from "@/constants";
import { useAppDispatch } from "@/store/storeConfig";
import { AuthUtil } from "@/utils/authUtil";
import { setCredentials } from "@/store/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ToastUtil } from "@/utils/toastUtil";
import { colors } from "@/config/colors";
import LoadingIndicator from "@/components/UI/LoadingIndicator";

const Register = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    routeId: "",
    role: "",
    email: "",
    password: "",
  });

  const { data: routes } = useGetRoutesQuery();
  const [register, { isLoading }] = useRegisterMutation();
  const handleRegistration = async () => {
    if (!AuthUtil.validateRegistrationForm(formData)) return;

    try {
      const result = await register(formData);

      if ("error" in result) {
        ToastUtil.error(result.error?.data?.errorMessage?.[0]?.message);
        return;
      }
      const { accessToken, user } = result.data;

      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE, JSON.stringify(user.routeId));

      dispatch(setCredentials({ user, route: user.routeId, accessToken }));
      ToastUtil.success(`Welcome, ${user.name}!`);
      router.replace("/home");
    } catch (err) {
      ToastUtil.error(err?.message || "Unexpected error occurred");
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-end px-10 mb-10">
          {/* Header - Matches Login Page Style */}
          <View className="">
            <Text className="text-title-2 font-semibold text-center mb-4">Track Your Campus Buses</Text>
            <Text className="text-body text-center text-muted-500 mb-10">
              Register to view real-time bus locations and schedules
            </Text>
          </View>

          {/* Name Input */}
          <View className="my-3">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="person-outline" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">Full Name</Text>
            </View>
            <TextInput
              value={formData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter your full name"
              className="border border-muted-300 rounded-xl px-4 py-4"
              editable={!isLoading}
            />
          </View>

          {/* Route Picker */}
          <View className="my-3">
            <View className="flex-row items-center gap-2 mb-2">
              <FontAwesome5 name="route" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">Bus Route</Text>
            </View>
            <View className="border border-muted-300 rounded-xl">
              <Picker
                selectedValue={formData.routeId}
                onValueChange={(value) => handleInputChange("routeId", value)}
                enabled={!isLoading}
              >
                <Picker.Item label="Select your bus route" value="" />
                {routes?.map((route) => (
                  <Picker.Item key={route._id} label={`${route.routeNo}: ${route.routeName} Route`} value={route._id} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Role Picker */}
          <View className="my-3">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="person-add-outline" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">Role</Text>
            </View>
            <View className="border border-muted-300 rounded-xl">
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
                enabled={!isLoading}
              >
                <Picker.Item label="Select your role" value="" />
                <Picker.Item label="Student" value="student" />
                <Picker.Item label="Employee" value="employee" />
              </Picker>
            </View>
          </View>

          {/* Email Input */}
          <View className="my-3">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialCommunityIcons name="email-outline" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">University Email</Text>
            </View>
            <TextInput
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              placeholder="abc@diu.edu.bd"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-muted-300 rounded-xl px-4 py-4"
              editable={!isLoading}
            />
          </View>

          {/* Password Input */}
          <View className="my-3">
            <View className="flex-row items-center gap-2 mb-2">
              <MaterialIcons name="lock-outline" size={20} color={colors.muted[700]} />
              <Text className="text-lg text-muted-700">Password</Text>
            </View>
            <View className="flex-row items-center border border-muted-300 rounded-xl px-4 py-4">
              <TextInput
                value={formData.password}
                onChangeText={(text) => handleInputChange("password", text)}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                className="flex-1"
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Button - Matches Login Button Style */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleRegistration}
              disabled={isLoading}
              className="w-full bg-secondary-900 p-3 rounded-xl flex-row justify-center"
            >
              {isLoading ? (
                <LoadingIndicator color="white" />
              ) : (
                <Text className="text-body text-center text-white">Register</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Already have an account - Matches Login Page Link Style */}
          <View className="mt-4 items-center">
            <View className="flex-row">
              <Text className="text-muted-600">Already have an account? </Text>
              <Link href="/login" className="text-secondary-700">
                Sign In
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
};

export default Register;
