import s from "../../App.module.css";
import Channel from "../Channel/Channel.tsx";
import {inputTarget, outputTarget, type ChannelTarget, type DspState} from "../../dsp/protocol.ts";
import type {FC} from "react";

interface OverviewProps {
  state: DspState | null;
  revision: number | null;
  setChannelGain: (target: ChannelTarget, gainDb: number) => Promise<number>;
  setChannelMuted: (target: ChannelTarget, muted: boolean) => Promise<number>;
  setChannelPeqEnabled: (target: ChannelTarget, enabled: boolean) => Promise<number>;
}

const Overview: FC<OverviewProps> = ({state, revision, setChannelMuted, setChannelPeqEnabled, setChannelGain}) => {
  return (
    <div className={"pagePadding"}>
      {state && revision !== null &&
          <div className={s.channels}>
            {state.dsp.inputs.map((c, i) =>
              <Channel revision={revision}
                       channel={c} key={`i` + i}
                       setChannelGain={(gainDb: number) => setChannelGain(inputTarget(i), gainDb)}
                       setChannelMuted={(muted: boolean) => setChannelMuted(inputTarget(i), muted)}
                       setChannelPeqEnabled={(enabled: boolean) => setChannelPeqEnabled(inputTarget(i), enabled)}/>
            )}
              <div className={s.spacing}></div>
            {state.dsp.outputs.map((c, i) =>
              <Channel revision={revision}
                       channel={c} key={`o` + i}
                       setChannelGain={(gainDb: number) => setChannelGain(outputTarget(i), gainDb)}
                       setChannelMuted={(muted: boolean) => setChannelMuted(outputTarget(i), muted)}
                       setChannelPeqEnabled={(enabled: boolean) => setChannelPeqEnabled(outputTarget(i), enabled)}/>
            )}
          </div>
      }
    </div>
  );
};

export default Overview;