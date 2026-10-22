import {useParams} from "react-router";
import type {DspInput, DspOutput, DspState} from "../../dsp/protocol.ts";
import type {FC} from "react";

interface ChannelViewProps {
  state: DspState | null;
  revision: number | null;
}

const ChannelView: FC<ChannelViewProps> = ({state, revision}) => {
  const {type, number} = useParams();
  const chNumber = parseInt(number ?? "");

  if(state === null || revision === null || isNaN(chNumber)) return null;

  const channels: DspInput[] | DspOutput[] = type === "input" ? state.dsp.inputs : state.dsp.outputs;
  const channel = channels[chNumber - 1];
  if(channel === undefined) return null;

  return (
    <div>
      <p>{type === "input" ? "In" : "Out"}-{number}</p>
    </div>
  );
};

export default ChannelView;