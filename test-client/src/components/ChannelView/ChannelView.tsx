import {useParams} from "react-router";
import type {DspInput, DspOutput, DspState} from "../../dsp/protocol.ts";
import type {FC} from "react";
import EqOverview from "../EqGraphSvg/EqOverview.tsx";
import s from "./ChannelView.module.css";
import classNames from "classnames";

interface ChannelViewProps {
  state: DspState | null;
  revision: number | null;
}

const ChannelView: FC<ChannelViewProps> = ({state, revision}) => {
  const {type: chType, number} = useParams();
  const chNumber = parseInt(number ?? "");

  if (state === null || revision === null || isNaN(chNumber) || (chType !== "input" && chType !== "output")) return null;

  const channels: DspInput[] | DspOutput[] = chType === "input" ? state.dsp.inputs : state.dsp.outputs;
  const channel = channels[chNumber - 1];
  if (channel === undefined) return null;

  return (
    <div className={s.layout}>
      <div className={s.header}>
        <p>{chType === "input" ? "In" : "Out"}-{number}</p>
      </div>
      <div className={s.middle}>
        <div className={s.bands}>
          <div className={classNames(s.bandRow, s.bandHeader)}>
            <p className={s.bandNoHeader}>No.</p>
            <p className={s.bandFreq}>Freq</p>
            <p className={s.bandQ}>Q</p>
            <p className={s.bandGain}>Gain</p>
          </div>
          {
            channel.peq.bands.map(((b, i) => (
              <div key={i} className={classNames(s.bandRow, !b.enabled && s.bandDisabled)}>
                <div className={s.bandNo}>
                  <p>{i + 1}</p>
                </div>
                <div className={s.inputWrapper}>
                  <input disabled={!b.enabled} className={classNames(s.bandInput, s.bandFreq)} value={b.frequency_hz}/>
                  <span className={s.unit}>Hz</span>
                </div>
                <input disabled={!b.enabled} className={classNames(s.bandInput, s.bandQInput)} value={b.q}/>
                <div className={s.inputWrapper}>
                  <input disabled={!b.enabled} className={classNames(s.bandInput, s.bandGain)} value={b.gain_db}/>
                  <span className={s.unit}>dB</span>
                </div>
                <button
                  className={classNames(s.bandEnable, b.enabled && s.bandEnabled)}>{b.enabled ? "On" : "Off"}</button>
              </div>
            )))
          }
        </div>
        <div className={s.peqGraph}>
          <EqOverview channel={channel} chNumber={chNumber}/>
        </div>
        <div className={s.channelSummary}>
        </div>
      </div>
    </div>
  );
};

export default ChannelView;