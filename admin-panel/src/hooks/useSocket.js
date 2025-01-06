import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; // Update this with your backend URL if hosted
const socket = io(SOCKET_URL);

export default function useSocket(onLocationUpdate) {
  useEffect(() => {
    socket.on("updateLocation", (location) => {
      console.log("Location update:", location);
      onLocationUpdate(location);
    });

    return () => socket.disconnect();
  }, [onLocationUpdate]);

  return socket;
}
