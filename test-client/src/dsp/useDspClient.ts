import type {DspMessage, DspRequest, DspResponse, DspState, HelloMessage, StateResponse} from "./protocol.ts";
import {useCallback, useRef, useState} from "react";
import {useWebSocket} from "../transport/useWebsocket.ts";

class DspProtocolError extends Error {
  public readonly field?: string;
  public readonly code: string;

  constructor(code: string, field?: string) {
    super(
      field
        ? `${code}: ${field}`
        : code
    );
    this.code = code;
    this.field = field;

    this.name = "DspProtocolError";
  }
}

interface PendingRequest {
  resolve: (response: DspResponse) => void;
  reject: (error: Error) => void;
  timeout: number;
}

const REQUEST_TIMEOUT_MS = 3000;

export const useDspClient = (url: string) => {
  const nextIdRef = useRef(1);

  const pendingRef = useRef(
    new Map<number, PendingRequest>()
  );

  const [hello, setHello] = useState<HelloMessage | null>(null);
  const [state, setState] = useState<DspState | null>(null);

  const handleMessage = useCallback((raw: unknown) => {
    if (typeof raw !== "object" || raw === null || !("type" in raw)) {
      console.warn("Invalid DSP Message", raw);
      return;
    }

    const message = raw as DspMessage;

    if (message.type === "hello") {
      setHello(message);
      return;
    }

    if (!("id" in message)) {
      console.warn("DSP Response missing ID", message);
      return;
    }

    const pending = pendingRef.current.get(message.id);

    if (!pending) {
      console.warn(`Received response for unknown request ${message.id}`, message);
      return;
    }

    pendingRef.current.delete(message.id);
    window.clearTimeout(pending.timeout);

    if (message.type === "error") {
      pending.reject(new DspProtocolError(message.error.code, message.error.field));
      return;
    }

    pending.resolve(message);
  }, []);

  const websocket = useWebSocket(url, {onMessage: handleMessage});

  const request = useCallback(
    <TResponse extends DspResponse>(
      request: Omit<DspRequest, "id"> | Record<string, unknown>) => {
      const id = nextIdRef.current++;

      return new Promise<TResponse>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          pendingRef.current.delete(id);

          reject(new Error(`DSP request ${id} timed out`));
        }, REQUEST_TIMEOUT_MS);

        pendingRef.current.set(id, {
          resolve: resolve as (response: DspResponse) => void,
          reject,
          timeout
        });

        try {
          websocket.send({
            ...request,
            id
          });
        } catch (error) {
          window.clearTimeout(timeout);
          pendingRef.current.delete(id);

          reject(error instanceof Error ? error : new Error("Could not send DSP request"));
        }
      });
    }, [websocket.send]);

  const getState = useCallback(async () => {
    const response = await request<StateResponse>({
      type: "get_state"
    });

    const newState = response.state;

    setState(newState);

    return newState;
  }, [request]);

  const setOutputGain = useCallback(async (output: number, gainDb: number) => {
      await request({
        type: "set_output_gain",
        output,
        gain_db: gainDb
      });
    },
    [request]
  );

  return {
    connected: websocket.connected,

    hello,
    state,

    getState,
    setOutputGain
  };
};
