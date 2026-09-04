import s from "./App.module.css";
import {useWebSocket} from "./hooks/useWebsocket.ts";
import classNames from "classnames";
const host = import.meta.env.VITE_VELODSP_HOST;

function App() {
  const {connected} = useWebSocket(`ws://${host}/ws`);

  return (
    <div>
      <div className={s.header}>
        <div className={classNames(s.status, connected && s.connected)}>{connected ? "Connected" : "Not connected"}</div>
      </div>
      <h1>testing-client</h1>
    </div>
  );
}

export default App;
