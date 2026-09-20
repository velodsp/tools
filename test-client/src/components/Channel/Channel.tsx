import s from "./Channel.module.css";
import {type FC, useEffect, useRef, useState} from "react";
import {useThrottledValueCallback} from "./useThrottledValueCallback.ts";
import type {DspInput, DspOutput} from "../../dsp/protocol.ts";
import {dbToSlider, sliderToDb} from "./sliderMappingUtils.ts";
import classNames from "classnames";
import toast from "react-hot-toast";

interface ChannelProps {
  channel: DspInput | DspOutput;
  revision: number;

  setChannelGain?: (gainDb: number) => Promise<number>;
}

const Channel: FC<ChannelProps> = ({channel, setChannelGain, revision}) => {
  const [draftGain, setDraftGain] = useState<number | null>(null);
  const [waitingForRevision, setWaitingForRevision] = useState<number | null>(null);
  const lastGainRequestRef = useRef<Promise<number> | null>(null);
  const authorativeGainDb = channel.gain_db;
  const displayGain = draftGain ?? authorativeGainDb;

  const gainSender = useThrottledValueCallback((gainDb) => {
    if(!setChannelGain) {
      return;
    }

    const request = setChannelGain(gainDb);

    void request.catch(error => {
      console.error("Could not set gain", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not set gain"
      );
    })

    lastGainRequestRef.current = request;
  }, 50);

  const changeGain = (gainDb: number) => {
    setDraftGain(gainDb);
    gainSender.send(gainDb);
  };

  const finishGainChange = async () => {
    gainSender.flush();

    const request = lastGainRequestRef.current;
    lastGainRequestRef.current = null;

    if(!request) {
      setDraftGain(null);
      return;
    }

    try {
      const committedRevision = await request;
      setWaitingForRevision(committedRevision);
    } catch {
      setDraftGain(null);
      setWaitingForRevision(null);
    }
  }

  useEffect(() => {
    if (
      waitingForRevision !== null &&
      revision >= waitingForRevision
    ) {
      setDraftGain(null);
      setWaitingForRevision(null);
    }
  }, [revision, waitingForRevision]);

  const sendMuted = (muted: boolean) => {
    console.log(muted);
  };

  return (
    <div className={s.channel}>
      <div className={s.gainSliderContainer}>
        <input type={"range"} min={0} max={1} step={0.25 / 12 / 2}
               onDoubleClick={() => {
                 changeGain(0);
                 void finishGainChange();
               }}
               onKeyUp={() => void finishGainChange()}
               onBlur={() => void finishGainChange()}
               draggable={false}
               className={s.gainSlider}
               value={dbToSlider(displayGain)}
               onChange={(e) => {
                 changeGain(sliderToDb(Number(e.target.value)));
               }}
               onPointerUp={finishGainChange}
               onPointerCancel={finishGainChange}
        />
      </div>
      <div className={s.controls}>
        <input className={s.gainInput} type={"text"} value={displayGain.toFixed(1)} readOnly={true}/>
        <button aria-pressed={channel.muted} onClick={() => sendMuted(!channel.muted)}
                className={classNames(s.muteButton, channel.muted && s.muted)}>Mute
        </button>
      </div>
    </div>
  );
};

export default Channel;