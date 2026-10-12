import s from "./App.module.css";
import classNames from "classnames";
import {useDspClient} from "./dsp/useDspClient.ts";
import Sidebar from "./components/Sidebar/Sidebar.tsx";
import {HashRouter, Route, Routes} from "react-router";
import Overview from "./components/Overview/Overview.tsx";

const host = import.meta.env.VITE_VELODSP_HOST;

function App() {
  const {
    connected,
    hello,
    state,
    revision,
    setChannelGain,
    setChannelMuted,
    setChannelPeqEnabled
  } = useDspClient(`ws://${host}/ws`);

  return (
    <div className={s.parent}>
      <div className={s.header}>
        <div
          className={classNames(s.status, connected && s.connected)}>{connected ? "Connected" : "Not connected"}</div>
        {hello && connected && <>
            <div>Firmware: {hello?.firmware_version}</div>
            <div>Protocol Version: {hello?.protocol_version}</div>
        </>}
      </div>
      <div className={s.container}>
        <Sidebar/>
        <div className={s.content}>
          <HashRouter>
            <Routes>
              <Route path={"/"} element={<Overview state={state} revision={revision} setChannelMuted={setChannelMuted}
                                                   setChannelPeqEnabled={setChannelPeqEnabled}
                                                   setChannelGain={setChannelGain}/>}/>
            </Routes>
          </HashRouter>
        </div>
      </div>
    </div>
  );
}

export default App;
