import s from "./Header.module.css";
import classNames from "classnames";
import type {HelloMessage} from "../../dsp/protocol.ts";
import type {FC} from "react";

interface Page {
  href: string;
  name: string;
}

const pages: Page[] = [
  {
    href: "",
    name: "Overview"
  },
  {
    href: "routing",
    name: "Routing"
  },
  {
    href: "eq",
    name: "Equalizer (EQ)"
  }
];

interface HeaderProps {
  connected: boolean;
  hello: HelloMessage | null;
}

const Header: FC<HeaderProps> = ({connected, hello}) => {
  return (
    <div className={s.header}>
      <div className={classNames(s.status, connected && s.connected)}>{connected ? "Connected" : "Not connected"}</div>
      {hello && connected && <>
          <div>Firmware: {hello?.firmware_version}</div>
          <div>Protocol Version: {hello?.protocol_version}</div>
      </>}
    </div>
  );
};

export default Header;