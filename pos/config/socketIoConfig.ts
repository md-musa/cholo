import Constants from "expo-constants";
import { io } from "socket.io-client";

const SERVER_URL =
  process.env.NODE_ENV === "development"
    ? Constants.expoConfig?.extra?.DVELOPMENT_SERVER_URL
    : Constants.expoConfig?.extra?.PRODUCTION_SERVER_URL;

const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
