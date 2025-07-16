import { Audio } from "expo-av";
import beepSuccessAudio from "@/assets/audios/beep.mp3";

export const playBeep = async () => {
  const { sound } = await Audio.Sound.createAsync(beepSuccessAudio);
  await sound.playAsync();
};

// const playErrorBeep = async () => {
//   const { sound } = await Audio.Sound.createAsync(require("@/assets/beep-fail.mp3"));
//   await sound.playAsync();
// };
