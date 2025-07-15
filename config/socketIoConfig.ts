import { ToastUtil } from "@/utils/toastUtil";
import Constants from "expo-constants";
import { io } from "socket.io-client";

// const SERVER_URL = "http://192.168.1.15:4000";
// const SERVER_URL = "https://choloserver-production.up.railway.app";

const SERVER_URL =
  process.env.NODE_ENV === "development"
    ? Constants.expoConfig?.extra?.DVELOPMENT_SERVER_URL
    : Constants.expoConfig?.extra?.PRODUCTION_SERVER_URL;

const socket = io(SERVER_URL, {
  autoConnect: false, // Automatically connect when the socket is created
  reconnection: true, // Enable reconnection
  reconnectionAttempts: 5, // Number of reconnection attempts
  reconnectionDelay: 2000, // Delay between reconnection attempts in milliseconds
  // transports: ["websocket"], // Use WebSocket transport only
});

// // Listen for successful connection
// socket.on("connect", () => {
//   // console.log("✅ Connected to socket server");
// });

// // Handle disconnection
// socket.on("disconnect", () => {
//   // console.warn("⚠️ Disconnected from socket server");
//   // ToastUtil.error("Disconnected from Server");
// });

// // Handle connection error
// socket.on("connect_error", (error: any) => {
//   // console.error("❌ Socket connection error:", error);
//   // ToastUtil.error("Unable to connect to the server");
// });

export default socket;
