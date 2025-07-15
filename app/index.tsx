import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect,  useState } from "react";
import { useRouter } from "expo-router";
import coverImage from "@/assets/images/login_bg.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { ASYNC_STORAGE_KEYS, USER_ROLES } from "@/constants";
import { useAppDispatch } from "@/store/storeConfig";
import { AuthUser, clearCredentials, setCredentials } from "@/store/features/auth/authSlice";
import LoadingScreen from "../components/UI/LoadingScreen";

// Prevent splash from auto-hiding
// SplashScreen.preventAutoHideAsync();

interface DecodedToken {
  _id: string;
  role: USER_ROLES;
  email: string;
  exp?: number;
}

const Index = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);
  // const checkPermissions = async () => {
  //   const fg = await Location.getForegroundPermissionsAsync();
  //   const bg = await Location.getBackgroundPermissionsAsync();

  //   console.log("Foreground:", fg.status); // granted / denied
  //   console.log("Background:", bg.status); // granted / denied
  // };
  // checkPermissions();

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
        const routeStr = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE);
        const route = routeStr ? JSON.parse(routeStr) : null;
        // console.log("token:", token);
        if (!token) {
          dispatch(clearCredentials());
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);

        const user: AuthUser = {
          _id: decoded._id,
          role: decoded.role,
          email: decoded.email,
        };

        dispatch(setCredentials({ user, route, accessToken: token }));
        router.replace("/home");
      } catch (err) {
        // console.log("error");
        // console.error("Initialization error:", err);
        dispatch(clearCredentials());
      } finally {
        setAppReady(true);
      }
    };

    initialize();
  }, []);

  // const onLayoutRootView = useCallback(async () => {
  //   if (appReady) {
  //     await SplashScreen.hideAsync();
  //     console.log("appready");
  //   }
  // }, [appReady]);

  if (!appReady) {
    return <LoadingScreen />;
  }



  return (
    <SafeAreaView className="flex justify-end h-full bg-white">
      <Image
        source={coverImage}
        className="w-4/5 h-[30%] mx-auto rounded-lg mt-5"
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

      <Text className="text-3xl font-bold text-center mt-10 mb-2 px-5 text-secondary-900">DIU Bus Tracker</Text>

      <Text className="text-lg text-muted-500 text-center px-8 mb-4">Track your university buses in real-time</Text>

      <Text className="text-footnote text-muted-400 text-center px-8 mb-8">
        Never miss your bus again! Get live updates on bus locations and schedules.
      </Text>

      <View className="mt-10 mb-10">
        <TouchableOpacity
          onPress={() => router.push("/login")}
          className="my-2 flex-row items-center justify-center bg-secondary-900 py-3 rounded-full mx-6"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          className="my-2 flex-row items-center justify-center bg-secondary-900 py-3 rounded-full mx-6"
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">Registration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Index;
