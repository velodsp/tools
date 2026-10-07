import s from "./Channel.module.css";
import {type FC, useEffect, useRef, useState} from "react";
import type {DspInput, DspOutput} from "../../dsp/protocol.ts";
import {dbToSlider, sliderToDb} from "./sliderMappingUtils.ts";
import classNames from "classnames";
import {useGainControl} from "./useGainControl.ts";
import {useToggleControl} from "./useToggleControl.ts";
import {parseDbInput} from "./parseUtils.ts";
import Fader from "../Fader/Fader.tsx";
import EqPreview from "../EqGraphSvg/EqPreview.tsx";

interface ChannelProps {
  channel: DspInput | DspOutput;
  revision: number;

  setChannelGain: (gainDb: number) => Promise<number>;
  setChannelMuted: (muted: boolean) => Promise<number>;
}

const dbMarkers = [10, 5, 0, -5, -10, -20, -40, -70];

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
    if (gainInputField === null) return;

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
      <div className={s.quickToggles}>
        <button className={classNames(s.quickToggle, channel.peq.enabled && s.quickToggleEnabled)}>EQ</button>
        <button className={s.quickToggle}>G</button>
        <button className={s.quickToggle}>C</button>
        <button className={s.quickToggle}>L</button>
      </div>
      <div className={s.peq}>
        <span className={s.eqSpan}>EQ</span>
        <svg viewBox={`0 0 96 72`}
             role={"img"} aria-label={`Frequency response`}
             preserveAspectRatio={"none"}>
          <EqPreview peq={channel.peq}/>
        </svg>
      </div>
      <div className={s.levelContainer}>
        <div className={s.dbScale}>
          {dbMarkers.map((db) => (
            <div key={db} className={s.dbMarker} style={{bottom: `${dbToSlider(db) * 100}%`}}>
              <span className={s.dbLabel}>{db}</span>
              <span className={s.dbTick}/>
            </div>
          ))}
        </div>
        <Fader value={dbToSlider(gain)} onChange={(value) => updateGain(sliderToDb(value))}
               onCommit={() => flushGain()}
               onDoubleClick={() => {
                 updateGain(0);
                 void flushGain();
               }}/>
      </div>
      <div className={s.controls}>
        <div className={s.gainInputWrapper}>
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
          <span className={s.gainUnit}>dB</span>
        </div>
        <button aria-pressed={muted} onClick={toggleMuted}
                className={classNames(s.muteButton, muted && s.muted)}>Mute
        </button>
      </div>
    </div>
  );
};

export default Channel;