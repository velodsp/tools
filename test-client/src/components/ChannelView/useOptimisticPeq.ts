import type {ChannelPeqBandPatch, DspInput, DspOutput} from "../../dsp/protocol.ts";
import {useEffect, useMemo, useRef, useState} from "react";

interface OptimisticEdit {
  id: number;
  band: number;
  patch: ChannelPeqBandPatch;
  targetRevision: number | null;
}

export function useOptimisticPeq({
                            channel,
                            channelIdx,
                            channelType,
                            revision,
                            setChannelPeqBand
                          }: {
  channel: DspInput | DspOutput;
  channelIdx: number;
  channelType: "input" | "output";
  revision: number;
  setChannelPeqBand: (patch: ChannelPeqBandPatch, band: number) => Promise<number>;
}) {
  const [edits, setEdits] = useState<OptimisticEdit[]>([]);
  const nextId = useRef(0);

  const latestRevision = useRef(revision);
  latestRevision.current = revision;

  useEffect(() => {
    setEdits(current =>
      current.filter(edit =>
        edit.targetRevision === null || edit.targetRevision > revision));
  }, [revision]);

  const updateBand = async (patch: ChannelPeqBandPatch, band: number) => {
    const id = ++nextId.current;

    setEdits(current => [
      ...current,
      {id, band, patch, targetRevision: null}
    ]);

    try {
      const targetRevision = await setChannelPeqBand({...patch, channel: channelIdx, channel_type: channelType}, band);

      setEdits(current => current
        .map(edit => edit.id === id ? {...edit, targetRevision} : edit)
        .filter(edit => edit.id !== id || latestRevision.current < targetRevision));

      return targetRevision;
    } catch (err) {
      setEdits(current => current.filter(edit => edit.id !== id));
      throw err;
    }
  };

  const displayChannel = useMemo(() => {
    if (edits.length === 0) return channel;

    return {
      ...channel,
      peq: {
        ...channel.peq,
        bands: channel.peq.bands.map((serverBand, index) =>
          edits
            .filter(edit => edit.band === index)
            .reduce((band, edit) => ({...band, ...edit.patch}), serverBand))
      }
    };
  }, [channel, edits]);

  return {displayChannel, updateBand};
}