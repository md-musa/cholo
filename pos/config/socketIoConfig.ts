import { io } from "socket.io-client";
import { SERVER_URL } from "./serverUrl.config";


const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
