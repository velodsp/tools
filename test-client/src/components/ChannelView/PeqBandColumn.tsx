import classNames from "classnames";
import s from "./ChannelView.module.css";
import type {ChannelPeqBandPatch, ChannelTarget, PeqBand} from "../../dsp/protocol.ts";
import type {FC} from "react";
import {useToggleControl} from "../Channel/useToggleControl.ts";
import {useNumericControl} from "../Channel/useNumericControl.ts";
import NumericInput from "../NumericInput.tsx";
import {formatDb, parseDbInput} from "../Channel/parseUtils.ts";
import {MAX_PEQ_GAIN_DB, MIN_PEQ_GAIN_DB} from "../Channel/sliderMappingUtils.ts";

interface PeqBandColumnProps extends ChannelTarget {
  revision: number;
  band: PeqBand;
  idx: number;
  setChannelPeqBand: (patch: ChannelPeqBandPatch, band: number) => Promise<number>;
}

const PeqBandColumn: FC<PeqBandColumnProps> = ({band, idx, revision, setChannelPeqBand, channel, channel_type}) => {
  const {toggled: enableToggled, toggle: toggleEnable} = useToggleControl({
    authoritativeToggled: band.enabled, revision,
    setToggled: (toggled: boolean) => setChannelPeqBand({enabled: toggled, channel, channel_type}, idx)
  });

  const {value: gain, updateValue: updateGain, flushValue: flushGain} = useNumericControl({
    authoritativeValue: band.gain_db,
    revision,
    setValue: (value: number) => setChannelPeqBand({gain_db: value, channel, channel_type}, idx),
    errorMessage: "Could not set band gain"
  });

  return (
    <div className={classNames(s.bandRow, !band.enabled && s.bandDisabled)}>
      <div className={s.bandNo}>
        <p>{idx + 1}</p>
      </div>
      <div className={s.inputWrapper}>
        <input disabled={!band.enabled} className={classNames(s.bandInput, s.bandFreq)} value={band.frequency_hz}/>
        <span className={s.unit}>Hz</span>
      </div>
      <input disabled={!band.enabled} className={classNames(s.bandInput, s.bandQInput)} value={band.q}/>
      {/*<div className={s.inputWrapper}>*/}
      {/*  <input disabled={!band.enabled} className={classNames(s.bandInput, s.bandGain)} value={band.gain_db}/>*/}
      {/*  <span className={s.unit}>dB</span>*/}
      {/*</div>*/}
      <NumericInput wrapperClassName={s.bandGain} value={gain} onCommit={(val) => {
        updateGain(val);
        void flushGain();
      }} parse={val => parseDbInput(val, MIN_PEQ_GAIN_DB, MAX_PEQ_GAIN_DB)} format={formatDb} maxLength={5} unit={"dB"}/>
      <button onClick={() => toggleEnable()}
              className={classNames(s.bandEnable, enableToggled && s.bandEnabled)}>{enableToggled ? "On" : "Off"}</button>
    </div>
  );
};

export default PeqBandColumn;