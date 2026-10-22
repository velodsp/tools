import s from "./Header.module.css";
import classNames from "classnames";
import type {FC, ReactNode} from "react";
import type {HelloMessage} from "../../dsp/protocol.ts";
import {LuLayoutDashboard, LuRoute} from "react-icons/lu";
import {RiEqualizerLine} from "react-icons/ri";
import {useLocation, useNavigate} from "react-router";

interface Page {
  href: string;
  name: string;
  icon: ReactNode;
}

const pages: Page[] = [
  {
    href: "/overview",
    name: "Overview",
    icon: <LuLayoutDashboard />
  },
  {
    href: "/routing",
    name: "Routing",
    icon: <LuRoute />
  },
  {
    href: "/eq",
    name: "Equalizer (EQ)",
    icon: <RiEqualizerLine />
  }
];

interface HeaderProps {
  connected: boolean;
  hello: HelloMessage | null;
}

const Header: FC<HeaderProps> = ({connected, hello}) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={s.header}>
      <div className={s.pages}>
        {pages.map(p => (
          <button onClick={() => navigate(p.href)} className={classNames(s.pageBtn, location.pathname.startsWith(p.href) && s.pageBtnActive)} key={p.href}>{p.icon}{p.name}</button>
        ))}
      </div>
      <div className={s.connectionInfo}>
        {hello && connected && <>
            <div>Firmware: {hello?.firmware_version}</div>
            <div>Protocol Version: {hello?.protocol_version}</div>
        </>}
        <div className={classNames(s.status, connected && s.connected)}>{connected ? "Connected" : "Not connected"}</div>
      </div>
    </div>
  );
};

export default Header;