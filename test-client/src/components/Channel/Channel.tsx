import s from "./Channel.module.css";
import {type FC} from "react";
import type {DspInput, DspOutput} from "../../dsp/protocol.ts";
import {dbToSlider, sliderToDb} from "./sliderMappingUtils.ts";
import classNames from "classnames";
import {useGainControl} from "./useGainControl.ts";

interface ChannelProps {
  channel: DspInput | DspOutput;
  revision: number;

  setChannelGain?: (gainDb: number) => Promise<number>;
}

const Channel: FC<ChannelProps> = ({channel, setChannelGain, revision}) => {
  const {displayGain, updateGain, flushGain} = useGainControl({authoritativeGainDb: channel.gain_db, revision, setGain: setChannelGain})

  const sendMuted = (muted: boolean) => {
    console.log(muted);
  };

  return (
    <div className={s.channel}>
      <div className={s.gainSliderContainer}>
        <input type={"range"} min={0} max={1} step={0.25 / 12 / 2}
               onDoubleClick={() => {
                 updateGain(0);
                 void flushGain();
               }}
               onKeyUp={flushGain}
               onBlur={flushGain}
               draggable={false}
               className={s.gainSlider}
               value={dbToSlider(displayGain)}
               onChange={(e) => {
                 updateGain(sliderToDb(Number(e.target.value)));
               }}
               onPointerUp={flushGain}
               onPointerCancel={flushGain}
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