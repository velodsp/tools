import {useCallback, useEffect, useRef, useState} from "react";
import toast from "react-hot-toast";

interface UseWebSocketOptions {
  onMessage?: (message: unknown) => void;
}

const CONNECT_TIMEOUT_MS = 3000;
const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 10000;

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
    let currentSocket: WebSocket | null = null;

    let connectTimeout: number | null = null;
    let reconnectTimer: number | null = null;

    let reconnectAttempt = 0;
    let reconnectToastId: string | undefined;

    const clearConnectTimeout = () => {
      if (connectTimeout !== null) {
        window.clearTimeout(connectTimeout);
        connectTimeout = null;
      }
    };

    const notifyDisconnected = () => {
      if (reconnectToastId === undefined) {
        reconnectToastId = toast.error("Connection to DSP lost. Retrying...");
      }
    };

    function scheduleReconnect() {
      if (disposed || reconnectTimer !== null) {
        return;
      }

      const delay = Math.min(INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttempt, MAX_RECONNECT_DELAY_MS);
      reconnectAttempt++;
      console.log(`WebSocket reconnecting in ${delay}ms`);

      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    }

    function connect() {
      if (disposed) {
        return;
      }

      if (currentSocket !== null &&
        (currentSocket.readyState === WebSocket.CONNECTING || currentSocket.readyState === WebSocket.OPEN)) {
        return;
      }

      setConnected(false);

      let socket: WebSocket;

      try {
        socket = new WebSocket(url);
      } catch (err) {
        console.error("Failed to create WebSocket", err);

        notifyDisconnected();
        scheduleReconnect();
        return;
      }

      currentSocket = socket;
      socketRef.current = socket;

      connectTimeout = window.setTimeout(() => {
        if (
          !disposed &&
          currentSocket === socket &&
          socket.readyState === WebSocket.CONNECTING
        ) {
          console.error("WebSocket connection timed out");
          notifyDisconnected();
          socket.close();
          scheduleReconnect();
        }
      }, CONNECT_TIMEOUT_MS);

      socket.onopen = () => {
        clearConnectTimeout();

        if (disposed || currentSocket !== socket) {
          return;
        }

        console.log("WebSocket connected");
        setConnected(true);
        reconnectAttempt = 0;

        if (reconnectToastId !== undefined) {
          toast.dismiss(reconnectToastId);
          reconnectToastId = undefined;
        }
      };

      socket.onclose = (event) => {
        clearConnectTimeout();

        if (disposed || currentSocket !== socket) {
          return;
        }

        currentSocket = null;

        if (socketRef.current === socket) {
          socketRef.current = null;
        }

        setConnected(false);

        console.log("WebSocket closed", {
          code: event.code,
          reason: event.reason,
          clean: event.wasClean
        });

        notifyDisconnected();
        scheduleReconnect();
      };

      socket.onerror = (event) => {
        if (!disposed && currentSocket === socket) {
          console.error("WebSocket error", event);
        }
      };

      socket.onmessage = (event) => {
        if (disposed || currentSocket !== socket) {
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
    }

    connect();

    return () => {
      disposed = true;

      clearConnectTimeout();

      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }

      if (reconnectToastId !== undefined) {
        toast.dismiss(reconnectToastId);
      }

      if (currentSocket !== null) {
        currentSocket.onopen = null;
        currentSocket.onclose = null;
        currentSocket.onerror = null;
        currentSocket.onmessage = null;

        currentSocket.close();
      }

      if (socketRef.current === currentSocket) {
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