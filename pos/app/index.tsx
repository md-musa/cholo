import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";

import LoadingScreen from "@/components/UI/LoadingScreen";
import { ASYNC_STORAGE_KEYS, USER_ROLES } from "@/constants";
import { useAppDispatch } from "@/store/storeConfig";
import { AuthUser, clearCredentials, setCredentials } from "@/store/features/auth/authSlice";

interface DecodedToken {
  userId: string;
  role: USER_ROLES;
  phoneNumber: string;
  exp?: number;
}

export default function Index() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.AUTH_TOKEN);
        const storedRoute = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.CURRENT_ROUTE);
        const route = storedRoute ? JSON.parse(storedRoute) : null;
        const storedBus = await AsyncStorage.getItem("current_bus");
        const bus = storedBus ? JSON.parse(storedBus) : null;

        if (!token) {
          dispatch(clearCredentials());
          router.replace("/login");
          return;
        }

        const decoded = jwtDecode<DecodedToken>(token);
        const isExpired = decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
        console.log("✅ token decodede:", decoded);
        if (isExpired) {
          await AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.AUTH_TOKEN, ASYNC_STORAGE_KEYS.CURRENT_ROUTE, "current_bus"]);
          dispatch(clearCredentials());
          router.replace("/login");
          return;
        }

        const user: AuthUser = {
          userId: decoded.userId,
          phoneNumber: decoded.phoneNumber,
          role: decoded.role,
        };

        dispatch(
          setCredentials({
            user,
            route,
            bus,
            accessToken: token,
          })
        );

        router.replace("/home");
      } catch {
        await AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.AUTH_TOKEN, ASYNC_STORAGE_KEYS.CURRENT_ROUTE]);
        dispatch(clearCredentials());
        router.replace("/login");
      } finally {
        setIsReady(true);
      }
    };

    initialize();
  }, [dispatch, router]);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <LoadingScreen />;
}
