import {useCallback, useEffect, useRef} from "react";

export function useThrottledValueCallback(callback: (value: number) => void, intervalMs: number) {
  const lastCall = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingValue = useRef<number | undefined>(undefined);

  const invokePending = useCallback(() => {
    if (pendingValue.current === undefined) {
      return;
    }

    const value = pendingValue.current;
    pendingValue.current = undefined;

    lastCall.current = Date.now();

    if (timeout.current !== null) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    callback(value);
  }, [callback, intervalMs]);

  const send = useCallback((value: number) => {
    pendingValue.current = value;

    const now = Date.now();
    const remaining = intervalMs - (now - lastCall.current);

    if (remaining <= 0) {
      invokePending();
      return;
    }

    if (timeout.current === null) {
      timeout.current = setTimeout(invokePending, remaining);
    }
  }, [intervalMs, invokePending]);

  const flush = useCallback(() => {
    invokePending();
  }, [invokePending]);

  const cancel = useCallback(() => {
    if (timeout.current !== null) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }

    pendingValue.current = undefined;
  }, []);

  useEffect(() => cancel, [cancel]);

  return {
    send,
    flush,
    cancel
  };
}
