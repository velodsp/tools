import {useCallback, useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";

interface UseWebSocketOptions {
  onMessage?: (message: unknown) => void;
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const [generation, setGeneration] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(options.onMessage);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = options.onMessage;
  }, [options.onMessage]);

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

      let message: unknown;

      try {
        message = JSON.parse(event.data);
      } catch {
        console.warn("Received non-JSON WebSocket message", event.data);
        return;
      }

      onMessageRef.current?.(message);
    };

    return () => {
      disposed = true;

      clearTimeout(timeout);
      socket.close();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [url, generation]);

  const send = useCallback((data: unknown) => {
    const socket = socketRef.current;

    if (socket?.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    socket.send(typeof data === "string" ? data : JSON.stringify(data));
  }, []);

  const reconnect = useCallback(() => {
    setConnected(false);
    setGeneration(g => g + 1);
  }, []);

  return {
    connected,
    send,
    reconnect
  };
};