import {useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";

export const useWebSocket = (url: string) => {
  const socketRef = useRef<WebSocket | null>(null);

  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown>(null);

  useEffect(() => {
    let disposed = false;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    const timeout = window.setTimeout(() => {
      if (socket.readyState === WebSocket.CONNECTING) {
        console.error("WebSocket connection timed out");

        socket.close();

        if (!disposed) {
          toast.error("Could not connect to device. Make sure the correct IP is set inside .env.local.");
        }
      }
    }, 3000);

    socket.onopen = () => {
      clearTimeout(timeout);

      if (!disposed) {
        setConnected(true);
      }
    };

    socket.onclose = (event) => {
      clearTimeout(timeout);

      if (!disposed) {
        setConnected(false);

        console.log("WebSocket closed", {
          code: event.code,
          reason: event.reason,
          clean: event.wasClean,
        });
      }
    };

    socket.onerror = (event) => {
      if (!disposed) {
        console.error("WebSocket error", event);
      }
    };

    socket.onmessage = (event) => {
      if (disposed) {
        return;
      }

      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        setLastMessage(event.data);
      }
    };

    return () => {
      disposed = true;

      clearTimeout(timeout);
      socket.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, []);

  const send = (data: unknown) => {
    const socket = socketRef.current;

    if (socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(typeof data === "string" ? data : JSON.stringify(data));
  };

  return {
    connected,
    lastMessage,
    send
  };
};