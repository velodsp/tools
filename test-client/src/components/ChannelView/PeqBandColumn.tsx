import classNames from "classnames";
import s from "./ChannelView.module.css";
import type {ChannelPeqBandPatch, ChannelTarget, PeqBand} from "../../dsp/protocol.ts";
import type {FC} from "react";
import {useToggleControl} from "../Channel/useToggleControl.ts";
import {useNumericControl} from "../Channel/useNumericControl.ts";
import NumericInput from "../NumericInput.tsx";
import {
  formatDb, formatHz,
  formatQ,
  MAX_PEQ_HZ,
  MAX_PEQ_Q,
  MIN_PEQ_HZ,
  MIN_PEQ_Q,
  parseDbInput, parseHzInput,
  parseQInput
} from "../Channel/parseUtils.ts";
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

  const {value: q, updateValue: updateQ, flushValue: flushQ} = useNumericControl({
    authoritativeValue: band.q,
    revision,
    setValue: (value: number) => setChannelPeqBand({q: value, channel, channel_type}, idx),
    errorMessage: "Could not set band q"
  });

  const {value: frequency, updateValue: updateFrequency, flushValue: flushFrequency} = useNumericControl({
    authoritativeValue: band.frequency_hz,
    revision,
    setValue: (value: number) => setChannelPeqBand({frequency_hz: value, channel, channel_type}, idx),
    errorMessage: "Could not set band frequency"
  });

  return (
    <div className={classNames(s.bandRow, !band.enabled && s.bandDisabled)}>
      <div className={s.bandNo}>
        <p>{idx + 1}</p>
      </div>
      <NumericInput disabled={!band.enabled} wrapperClassName={s.bandFreq} value={frequency} onCommit={(val) => {
        updateFrequency(val);
        void flushFrequency();
      }} parse={val => parseHzInput(val, MIN_PEQ_HZ, MAX_PEQ_HZ)} format={formatHz} maxLength={7} unit={"Hz"}/>
      <NumericInput disabled={!band.enabled} wrapperClassName={s.bandQInput} value={q} onCommit={(val) => {
        updateQ(val);
        void flushQ();
      }} parse={val => parseQInput(val, MIN_PEQ_Q, MAX_PEQ_Q)} format={formatQ} maxLength={5}/>
      <NumericInput disabled={!band.enabled} wrapperClassName={s.bandGain} value={gain} onCommit={(val) => {
        updateGain(val);
        void flushGain();
      }} parse={val => parseDbInput(val, MIN_PEQ_GAIN_DB, MAX_PEQ_GAIN_DB)} format={formatDb} maxLength={5} unit={"dB"}/>
      <button onClick={() => toggleEnable()}
              className={classNames(s.bandEnable, enableToggled && s.bandEnabled)}>{enableToggled ? "On" : "Off"}</button>
    </div>
  );
};

export default PeqBandColumn;