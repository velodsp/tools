import s from "./Channel.module.css";
import {type FC} from "react";
import type {DspInput, DspOutput} from "../../dsp/protocol.ts";
import {dbToSlider, sliderToDb} from "./sliderMappingUtils.ts";
import classNames from "classnames";
import {useGainControl} from "./useGainControl.ts";
import {useToggleControl} from "./useToggleControl.ts";

interface ChannelProps {
  channel: DspInput | DspOutput;
  revision: number;

  setChannelGain: (gainDb: number) => Promise<number>;
  setChannelMuted: (muted: boolean) => Promise<number>;
}

const Channel: FC<ChannelProps> = ({channel, revision, setChannelGain, setChannelMuted}) => {
  const {gain, updateGain, flushGain} = useGainControl({
    authoritativeGainDb: channel.gain_db,
    revision,
    setGain: setChannelGain
  });
  const {toggled: muted, toggle: toggleMuted} = useToggleControl({
    authoritativeToggled: channel.muted,
    revision,
    setToggled: setChannelMuted
  });

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
               value={dbToSlider(gain)}
               onChange={(e) => {
                 updateGain(sliderToDb(Number(e.target.value)));
               }}
               onPointerUp={flushGain}
               onPointerCancel={flushGain}
        />
      </div>
      <div className={s.controls}>
        <input className={s.gainInput} type={"text"} value={gain.toFixed(1)} readOnly={true}/>
        <button aria-pressed={muted} onClick={toggleMuted}
                className={classNames(s.muteButton, muted && s.muted)}>Mute
        </button>
      </div>
    </div>
  );
};

export default Channel;