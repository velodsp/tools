import type {
  DspMessage,
  DspRequest,
  DspResponse,
  DspState,
  HelloMessage, OkResponse,
  StateUpdateMessage
} from "./protocol.ts";
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

interface AuthoritativeState {
  revision: number;
  value: DspState;
}

const REQUEST_TIMEOUT_MS = 3000;

export const useDspClient = (url: string) => {
  const nextIdRef = useRef(1);
  const revisionRef = useRef<number | null>(null);
  const [authoritative, setAuthoritative] = useState<AuthoritativeState | null>(null);

  const pendingRef = useRef(
    new Map<number, PendingRequest>()
  );

  const [hello, setHello] = useState<HelloMessage | null>(null);

  const handleMessage = (raw: unknown) => {
    if (typeof raw !== "object" || raw === null || !("type" in raw)) {
      console.warn("Invalid DSP Message", raw);
      return;
    }

    const message = raw as DspMessage;

    if (message.type === "hello") {
      setHello(message);

      revisionRef.current = message.revision;
      setAuthoritative({
        revision: message.revision,
        value: message.state
      });

      return;
    }

    if (message.type === "state_update") {
      handleStateUpdate(message);
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
  };

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

  const handleStateUpdate = (update: StateUpdateMessage) => {
    const currentRevision = revisionRef.current;

    if (currentRevision == null) {
      reconnect();
      return;
    }

    // already processed or obsolete
    if (update.revision <= currentRevision) {
      return;
    }

    // an update is missing (gap)
    if (update.revision !== currentRevision + 1) {
      console.warn(`DSP revision gap: has ${currentRevision}, got ${update.revision}`);

      reconnect();
      return;
    }

    revisionRef.current = update.revision;

    setAuthoritative(current => {
      if (current === null) return current;

      return {
        revision: update.revision,
        value: applyStateUpdate(current.value, update)
      };
    });
  };

  const rejectPendingRequests = (reason: Error) => {
    for (const pending of pendingRef.current.values()) {
      window.clearTimeout(pending.timeout);
      pending.reject(reason);
    }

    pendingRef.current.clear();
  };

  const reconnect = () => {
    revisionRef.current = null;
    setAuthoritative(null);

    rejectPendingRequests(new Error("DSP connection was reset"));
    websocket.reconnect();
  }

  function applyStateUpdate(state: DspState, update: StateUpdateMessage) {
    let next = state;

    for (const change of update.changes) {
      switch (change.type) {
        case "output_gain": {
          const outputs = [...next.dsp.outputs];

          outputs[change.output] = {
            ...outputs[change.output],
            gain_db: change.gain_db
          };

          next = {
            ...next,
            dsp: {
              ...next.dsp,
              outputs
            }
          };

          break;
        }
        case "preset_modified": {
          next = {
            ...next,
            preset_modified: change.value
          };

          break;
        }
      }
    }

    return next;
  }

  const setOutputGain = useCallback(async (output: number, gainDb: number) => {
      const response = await request<OkResponse>({
        type: "set_output_gain",
        output,
        gain_db: gainDb
      });

      return response.revision;
    },
    [request]
  );

  return {
    connected: websocket.connected,

    hello,
    state: authoritative?.value ?? null,
    revision: authoritative?.revision ?? null,

    setOutputGain
  };
};
