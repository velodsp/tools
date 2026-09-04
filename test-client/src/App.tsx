import s from "./App.module.css";
import classNames from "classnames";
import {useDspClient} from "./dsp/useDspClient.ts";
const host = import.meta.env.VITE_VELODSP_HOST;

function App() {
  const {connected, hello} = useDspClient(`ws://${host}/ws`);

  return (
    <div>
      <div className={s.header}>
        <div className={classNames(s.status, connected && s.connected)}>{connected ? "Connected" : "Not connected"}</div>
        {hello && connected && <>
            <div>Firmware: {hello?.firmware_version}</div>
            <div>Protocol Version: {hello?.protocol_version}</div>
        </>}
      </div>
    </div>
  );
}

export default App;
