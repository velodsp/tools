import s from "./App.module.css";
import classNames from "classnames";
import {useDspClient} from "./dsp/useDspClient.ts";
import Channel from "./components/Channel/Channel.tsx";

const host = import.meta.env.VITE_VELODSP_HOST;

function App() {
  const {connected, hello, state, revision, setOutputGain} = useDspClient(`ws://${host}/ws`);

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
            {state.dsp.inputs.map((c, i) => <Channel revision={revision} channel={c} key={`i` + i}/>)}
            {state.dsp.outputs.map((c, i) => <Channel revision={revision}
              setChannelGain={(gainDb: number) => setOutputGain(i, gainDb)}
              channel={c} key={`o` + i}/>)}
          </div>
      }
    </div>
  );
}

export default App;
