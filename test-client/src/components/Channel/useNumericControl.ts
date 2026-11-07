import {useEffect, useRef, useState} from "react";
import {useThrottledValueCallback} from "./useThrottledValueCallback.ts";
import toast from "react-hot-toast";

interface UseNumericControlProps {
  authoritativeValue: number;
  revision: number;
  setValue: (value: number) => Promise<number>;
  throttleMs?: number;
  errorMessage?: string;
}

export function useNumericControl({
                                    authoritativeValue,
                                    revision,
                                    setValue,
                                    throttleMs = 50,
                                    errorMessage = "Could not update value"
                                  }: UseNumericControlProps) {
  const [draftValue, setDraftValue] = useState<number | null>(null);
  const [pendingRevision, setPendingRevision] = useState<number | null>(null);
  const latestRequestId = useRef(0);

  const latestRequest = useRef<Promise<number> | null>(null);

  const sender = useThrottledValueCallback((value) => {
    const requestId = ++latestRequestId.current;

    const request = setValue(value);

    latestRequest.current = request;

    void request.catch(error => {
      if (requestId !== latestRequestId.current) {
        return;
      }

      console.error(errorMessage, error);

      toast.error(error instanceof Error ? error.message : errorMessage);
    });
  }, throttleMs);

  const updateValue = (value: number) => {
    setDraftValue(value);
    sender.send(value);
  };

  const flushValue = async () => {
    sender.flush();

    const request = latestRequest.current;
    latestRequest.current = null;

    try {
      const revision = await request;
      setPendingRevision(revision);
    } catch {
      setDraftValue(null);
      setPendingRevision(null);
    }
  };

  useEffect(() => {
    if (pendingRevision !== null && revision >= pendingRevision) {
      setDraftValue(null);
      setPendingRevision(null);
    }
  }, [revision, pendingRevision]);

  return {
    value: draftValue ?? authoritativeValue,
    updateValue,
    flushValue
  };
}