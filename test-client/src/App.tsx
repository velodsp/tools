import s from "./App.module.css";
import classNames from "classnames";
import {useDspClient} from "./dsp/useDspClient.ts";
import Channel from "./components/Channel/Channel.tsx";
import {inputTarget, outputTarget} from "./dsp/protocol.ts";

const host = import.meta.env.VITE_VELODSP_HOST;

function App() {
  const {connected, hello, state, revision, setChannelGain, setChannelMuted} = useDspClient(`ws://${host}/ws`);

  return (
    <div>
      <div className={s.header}>
        <div
          className={classNames(s.status, connected && s.connected)}>{connected ? "Connected" : "Not connected"}</div>
        {hello && connected && <>
            <div>Firmware: {hello?.firmware_version}</div>
            <div>Protocol Version: {hello?.protocol_version}</div>
        </>}
      </div>
      {state && revision !== null &&
          <div className={s.channels}>
            {state.dsp.inputs.map((c, i) =>
              <Channel revision={revision}
                       channel={c} key={`i` + i}
                       setChannelGain={(gainDb: number) => setChannelGain(inputTarget(i), gainDb)}
                       setChannelMuted={(muted: boolean) => setChannelMuted(inputTarget(i), muted)}/>
            )}
            {state.dsp.outputs.map((c, i) =>
              <Channel revision={revision}
                       channel={c} key={`o` + i}
                       setChannelGain={(gainDb: number) => setChannelGain(outputTarget(i), gainDb)}
                       setChannelMuted={(muted: boolean) => setChannelMuted(outputTarget(i), muted)}/>
            )}
          </div>
      }
    </div>
  );
}

export default App;
