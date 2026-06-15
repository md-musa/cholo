import { Audio } from "expo-av";
import successAudio from "@/assets/audios/success.mp3";
import failureAudio from "@/assets/audios/failure.mp3";
import * as Location from "expo-location";
import { Alert, Linking, Platform } from "react-native";

export const playSound = async (status: string) => {
  const success = await Audio.Sound.createAsync(successAudio);
  const failure = await Audio.Sound.createAsync(failureAudio);
  try {
    if (status === "success") {
      await success.sound.playAsync();
    } else if (status === "error") {
      await failure.sound.playAsync();
    }
  } catch (error) {
    console.error("Error playing sound:", error);
  }
};

export const checkEssentialPermissions = async (): Promise<boolean> => {
  try {
    // 1. Check Location Permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location Required", "This app needs location access for fare calculation", [
        {
          text: "Open Settings",
          onPress: () => Linking.openSettings(),
        },
        { text: "Not Now", style: "cancel" },
      ]);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
};
