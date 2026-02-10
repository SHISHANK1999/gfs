import { io } from "socket.io-client";
import { API_BASE_URL } from "./api";

const SOCKET_BASE_URL = (process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL).replace(/\/$/, "");

export const socket = io(SOCKET_BASE_URL, {
  transports: ["websocket"],
  autoConnect: true
});
