import { Audio } from "expo-av";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

import failureAudio from "@/assets/audios/failure.mp3";
import successAudio from "@/assets/audios/success.mp3";

export const playSound = async (status: "success" | "error") => {
  const source = status === "success" ? successAudio : failureAudio;
  const { sound } = await Audio.Sound.createAsync(source);

  try {
    await sound.playAsync();
  } finally {
    sound.setOnPlaybackStatusUpdate((playbackStatus) => {
      if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
        sound.unloadAsync().catch(() => undefined);
      }
    });
  }
};

export const requestForegroundLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      return true;
    }

    Alert.alert("Location permission required", "The POS app needs GPS to calculate fare and share the bus location.", [
      {
        text: "Open Settings",
        onPress: () => Linking.openSettings(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);

    return false;
  } catch {
    return false;
  }
};
