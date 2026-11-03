import {useParams} from "react-router";
import type {ChannelPeqBandPatch, DspInput, DspOutput, DspState} from "../../dsp/protocol.ts";
import type {FC} from "react";
import EqOverview from "../EqGraphSvg/EqOverview.tsx";
import s from "./ChannelView.module.css";
import classNames from "classnames";
import PeqBandColumn from "./PeqBandColumn.tsx";

interface ChannelViewProps {
  state: DspState | null;
  revision: number | null;
  setChannelPeqBand: (patch: ChannelPeqBandPatch, band: number) => Promise<number>;
}

const ChannelView: FC<ChannelViewProps> = ({state, revision, setChannelPeqBand}) => {
  const {type: chType, number} = useParams();
  const chNumber = parseInt(number ?? "");

  if (state === null || revision === null || isNaN(chNumber) || (chType !== "input" && chType !== "output")) return null;

  const channels: DspInput[] | DspOutput[] = chType === "input" ? state.dsp.inputs : state.dsp.outputs;
  const channel = channels[chNumber - 1];
  if (channel === undefined) return null;
  const chIdx = chNumber - 1;

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
              <PeqBandColumn key={i} band={b} idx={i} revision={revision} setChannelPeqBand={setChannelPeqBand} channel={chIdx} channel_type={chType}/>
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