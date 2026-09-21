import {useEffect, useRef, useState} from "react";
import {useThrottledValueCallback} from "./useThrottledValueCallback.ts";
import toast from "react-hot-toast";

export function useGainControl({authoritativeGainDb, revision, setGain}: {
  authoritativeGainDb: number;
  revision: number;
  setGain?: (gainDb: number) => Promise<number>;
}) {
  const [draftGain, setDraftGain] = useState<number | null>(null);
  const [pendingRevision, setPendingRevision] = useState<number | null>(null);

  const latestRequest = useRef<Promise<number> | null>(null);

  const sender = useThrottledValueCallback((gainDb) => {
    if (!setGain) {
      return;
    }

    const request = setGain(gainDb);

    latestRequest.current = request;

    void request.catch(error => {
      console.error("Could not set gain", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not set gain"
      );
    });
  }, 50);

  const updateGain = (gainDb: number) => {
    setDraftGain(gainDb);
    sender.send(gainDb);
  }

  const flushGain = async () => {
    sender.flush();

    const request = latestRequest.current;
    latestRequest.current = null;

    try {
      const revision = await request;
      setPendingRevision(revision);
    } catch {
      setDraftGain(null);
      setPendingRevision(null);
    }
  }

  useEffect(() => {
    if(pendingRevision !== null && revision >= pendingRevision) {
      setDraftGain(null);
      setPendingRevision(null);
    }
  }, [revision, pendingRevision]);

  return {
    displayGain: draftGain ?? authoritativeGainDb,
    updateGain,
    flushGain
  }
}