import s from "./App.module.css";
import {useDspClient} from "./dsp/useDspClient.ts";
import {Navigate, Route, Routes} from "react-router";
import Overview from "./components/Overview/Overview.tsx";
import Header from "./components/Header/Header.tsx";

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
      <Header connected={connected} hello={hello}/>
      <div className={s.container}>
        <div className={s.content}>
          <Routes>
            <Route path={"/overview"} element={<Overview state={state} revision={revision} setChannelMuted={setChannelMuted}
                                                 setChannelPeqEnabled={setChannelPeqEnabled}
                                                 setChannelGain={setChannelGain}/>}/>
            <Route path={"/"} element={<Navigate to={"/overview"} replace={true}/>}/>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
