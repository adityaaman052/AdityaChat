import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { host } from "../utils/APIRoutes"; // Assuming host contains the WebSocket server URL

export const useSocket = (currentUser, setMessages) => {
  const socket = useRef(null);

  useEffect(() => {
    if (currentUser) {
      // Initialize socket connection only once
      if (!socket.current) {
        socket.current = io(host, {
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });

        socket.current.emit("add-user", currentUser._id);

        // Listen for incoming messages
        socket.current.on("msg-recieve", (msg) => {
          setMessages((prevMessages) => [...prevMessages, msg]);
        });

        // Handle reconnection attempts
        socket.current.on("reconnect_attempt", () => {
          console.log("Reconnecting...");
        });

        socket.current.on("reconnect_error", (error) => {
          console.error("Reconnection failed:", error);
        });
      }

      // Cleanup function to disconnect and remove listeners
      return () => {
        if (socket.current) {
          socket.current.off("msg-recieve");
          socket.current.disconnect();
          socket.current = null;
        }
      };
    }
  }, [currentUser, setMessages]);

  return socket;
};
