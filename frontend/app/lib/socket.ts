import { io } from "socket.io-client";

<<<<<<< HEAD
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true
});
=======
export const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL as string,
  {
    transports: ["websocket"],
    autoConnect: true
  }
);
>>>>>>> stable-day13
