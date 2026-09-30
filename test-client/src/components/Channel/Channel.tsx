import s from "./Channel.module.css";
import {type FC, useEffect, useRef, useState} from "react";
import type {DspInput, DspOutput} from "../../dsp/protocol.ts";
import {dbToSlider, sliderToDb} from "./sliderMappingUtils.ts";
import classNames from "classnames";
import {useGainControl} from "./useGainControl.ts";
import {useToggleControl} from "./useToggleControl.ts";
import {parseDbInput} from "./parseUtils.ts";

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
  const [gainInputField, setGainInputField] = useState<string | null>(null);
  const [invalidGainInput, setInvalidGainInput] = useState<boolean>(false);
  const skipNextBlurCommit = useRef(false);

  const commitGainInputField = () => {
    if(gainInputField === null) return;

    const dbParseResult = parseDbInput(gainInputField);

    if (dbParseResult === null) {
      setInvalidGainInput(true);
      return;
    }

    setInvalidGainInput(false);
    setGainInputField(null);

    updateGain(dbParseResult);
    void flushGain();
  };

  useEffect(() => {
    setInvalidGainInput(false);
    setGainInputField(null);
  }, [gain]);

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
        <input className={classNames(s.gainInput, invalidGainInput && s.invalidGain)} type={"text"}
               value={gainInputField ?? gain.toFixed(1)}
               maxLength={5}
               onChange={(e) => {
                 setGainInputField(e.target.value);
                 setInvalidGainInput(false);
               }}
               onKeyDown={(e) => {
                 if (e.key === "Enter") {
                   e.currentTarget.blur();
                 }

                 if (e.key === "Escape") {
                   skipNextBlurCommit.current = true;
                   setGainInputField(null);
                   setInvalidGainInput(false);
                   e.currentTarget.blur();
                 }
               }}
               onBlur={() => {
                 if (skipNextBlurCommit.current) {
                   skipNextBlurCommit.current = false;
                   return;
                 }

                 commitGainInputField();
               }}/>
        <button aria-pressed={muted} onClick={toggleMuted}
                className={classNames(s.muteButton, muted && s.muted)}>Mute
        </button>
      </div>
    </div>
  );
};

export default Channel;