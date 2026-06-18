import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";

import LoadingScreen from "@/components/UI/LoadingScreen";
import { ASYNC_STORAGE_KEYS, USER_ROLES } from "@/constants";
import { useAppDispatch } from "@/store/storeConfig";
import { AuthUser, clearCredentials, setCredentials } from "@/store/features/auth/authSlice";
import { fetchPosAssignment } from "@/utils/posAssignment";
import { ToastUtil } from "@/utils/toastUtil";

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
          name: null,
          email: null,
        };
        const assignment = await fetchPosAssignment(decoded.userId);

        if (!assignment.route || !assignment.bus) {
          await AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.AUTH_TOKEN, ASYNC_STORAGE_KEYS.CURRENT_ROUTE, "current_bus"]);
          dispatch(clearCredentials());
          ToastUtil.error("No route or bus is assigned to this POS device.");
          router.replace("/login");
          return;
        }

        dispatch(
          setCredentials({
            user,
            route: assignment.route,
            bus: assignment.bus,
            accessToken: token,
          })
        );

        router.replace("/home");
      } catch {
        await AsyncStorage.multiRemove([ASYNC_STORAGE_KEYS.AUTH_TOKEN, ASYNC_STORAGE_KEYS.CURRENT_ROUTE, "current_bus"]);
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
