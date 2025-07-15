import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import Constants from "expo-constants";
import { useAppDispatch, useAppSelector } from "@/store/storeConfig";
import { clearCredentials } from "@/store/features/auth/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "@/config/axiosInstance";

export default function Settings() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, route } = useAppSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/user", {
          params: {
            userId: user._id,
          },
        });
        setUserData(data);
        //console.log(data);
      } catch (error) {
        // console.log(error);
      }
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    try {
      router.dismissAll();
      await AsyncStorage.clear();
      router.replace("/");
      dispatch(clearCredentials());
    } catch (err) {
      //console.log(err);
    }
  };

  const handleContact = () => {
    Linking.openURL("mailto:mohammad.musa706@gmail.com");
  };

  return (
    <ScrollView className="flex-1 bg-muted-100">
      {/* Profile Header */}
      <View className="bg-secondary-600 pb-8 pt-12 px-6 rounded-b-3xl shadow-lg">
        <View className="items-center -mt-16">
          <View className="bg-white p-1 rounded-full shadow-xl">
            {/* <Image
              source={require("../../../../assets/images/profile_placeholder.png")}
              className="w-32 h-32 rounded-full border-4 border-secondary-100"
            /> */}
          </View>
          <Text className="text-2xl font-bold text-white mt-4">{userData?.name}</Text>
          <Text className="text-secondary-100">{userData?.email}</Text>

          <View className="flex-row mt-4 space-x-4">
            <View className="bg-secondary-500 px-4 py-2 rounded-full">
              <Text className="text-white text-sm capitalize">{userData?.role}</Text>
            </View>
            <View className="bg-secondary-500 px-4 mx-2 py-2 rounded-full">
              <Text className="text-white text-sm">{route?.routeName || "N/A"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Settings Cards */}
      <View className="px-5 mt-2">
        {/* Account Settings */}
        {/* <View className="bg-white rounded-2xl p-5 shadow-sm my-2">
          <Text className="text-lg font-semibold text-muted-800 mb-4">Account Settings</Text>
          <SettingOption icon="person-outline" text="Edit Profile" onPress={() => {}} />
          <SettingOption icon="notifications-outline" text="Notification Preferences" onPress={() => {}} />
          <SettingOption icon="lock-closed-outline" text="Change Password" onPress={() => {}} />
        </View> */}

        {/* App Settings */}
        {/* <View className="bg-white rounded-2xl p-5 shadow-sm my-2">
          <Text className="text-lg font-semibold text-muted-800 mb-4">App Settings</Text>
          <SettingOption icon="moon-outline" text="Dark Mode" rightComponent={<ToggleSwitch />} />
          <SettingOption
            icon="language"
            text="Language"
            rightComponent={<Text className="text-muted-500">English</Text>}
          />
          <SettingOption icon="location-outline" text="Location Services" rightComponent={<ToggleSwitch />} />
        </View> */}

        {/* Support */}
        <View className="bg-white border border-muted-300 rounded-2xl p-5 shadow-sm my-2">
          <Text className="text-lg font-semibold text-muted-800 mb-4">Support</Text>
          {/* <SettingOption icon="help-circle-outline" text="Help Center" onPress={() => {}} /> */}
          <SettingOption icon="mail-outline" text="Contact Support" onPress={handleContact} />
          <SettingOption
            icon="shield-checkmark-outline"
            text="Privacy Policy"
            onPress={() => router.push("/home/setting/privacyAndPolicy")}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-red-50 p-4 rounded-2xl border border-red-300 mt-5"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#dc2626" />
          <Text className="text-red-600 font-medium ml-3">Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View className="items-center my-8">
        <Text className="text-muted-400 text-sm">CHOLO v{Constants.expoConfig.version}</Text>
      </View>

      {/* <View className="px-5 mt-2 border border-muted-300 mx-5 bg-white rounded-2xl p-5 shadow-sm my-2">
        <Text className="text-lg font-semibold text-muted-800 mb-4">Developed by:</Text> */}

      {/* Developer Profile */}
      {/* <View className="flex-row items-start mb-4">
        
          <Image
            source={musaImg} // Replace with your image
            className="w-20 h-20 rounded-full border-2 border-muted-300"
          /> */}

      {/* Developer Info */}
      {/* <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-muted-900">Mohammad Musa</Text>
            <Text className="text-muted-600">Software Developer</Text>
            <Text className="text-muted-500 text-sm mt-1">
              Building innovative mobile solutions with React Native and Node.js
            </Text>


            <View className="flex-row mt-3">
              <TouchableOpacity
                onPress={() => Linking.openURL("https://facebook.com/yourprofile")}
                className="mx-2 bg-blue-100 p-2 rounded-full"
              >
                <FontAwesome name="facebook" size={15} color="#3b5998" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL("https://linkedin.com/in/yourprofile")}
                className="mx-2 bg-blue-100 p-2 rounded-full"
              >
                <FontAwesome name="linkedin" size={18} color="#0077b5" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL("mailto:mohammad.musa706@gmail.com")}
                className="mx-2 bg-red-100 p-2 rounded-full"
              >
                <MaterialIcons name="email" size={18} color="#d44638" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Linking.openURL("https://github.com/yourprofile")}
                className="mx-2 bg-muted-100 p-2 rounded-full"
              >
                <FontAwesome name="github" size={18} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        </View> */}

      {/* Skills/Technologies */}
      {/* <View className="mt-4">
          <Text className="text-md font-semibold text-muted-700 mb-2">Technologies Used:</Text>
          <View className="flex-row flex-wrap">
            {["React Native", "Expo", "Node.js", "TypeScript", "Tailwind CSS"].map((tech) => (
              <View key={tech} className="bg-muted-100 px-3 py-1 rounded-full mr-2 mb-2">
                <Text className="text-muted-700 text-sm">{tech}</Text>
              </View>
            ))}
          </View>
        </View> */}

      {/* Contact Button */}
      {/* <TouchableOpacity
          className="mt-5 bg-secondary-600 py-3 rounded-lg flex-row items-center justify-center"
          onPress={() => Linking.openURL("mailto:mohammad.musa706@gmail.com")}
        >
          <MaterialIcons name="email" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Contact Developer</Text>
        </TouchableOpacity> */}
      {/* </View> */}
    </ScrollView>
  );
}

// Reusable Components
const SettingOption = ({ icon, text, onPress, rightComponent, color = "gray" }) => (
  <TouchableOpacity
    className="flex-row items-center justify-between py-4 border-b border-muted-100 last:border-b-0"
    onPress={onPress}
    disabled={!onPress}
  >
    <View className="flex-row items-center">
      <Ionicons name={icon} size={22} color={color === "gray" ? "#6b7280" : color} style={{ marginRight: 12 }} />
      <Text className="text-muted-700">{text}</Text>
    </View>
    {rightComponent || <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
  </TouchableOpacity>
);

const ToggleSwitch = () => (
  <View className="w-12 h-6 bg-muted-200 rounded-full p-1">
    <View className="w-4 h-4 bg-white rounded-full shadow-md"></View>
  </View>
);
