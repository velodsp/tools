import {type FC, useRef} from "react";
import s from "./Fader.module.css";
import {dbToSlider, sliderToDb} from "../Channel/sliderMappingUtils.ts";

interface FaderProps {
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  onDoubleClick?: () => void;
}

const Fader: FC<FaderProps> = ({value, onCommit, onChange, onDoubleClick}) => {
  const lastPointerDown = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const updatePointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const normalized = 1 - (clientY - rect.top) / rect.height;
    onChange(Math.max(0, Math.min(1, normalized)));
  };

  return (
    <div className={s.fader} role={"slider"} tabIndex={0} aria-valuemin={0} aria-valuemax={1} aria-valuenow={value}
         onPointerDown={(e) => {
           const now = performance.now();
           const isDoubleClick = now - lastPointerDown.current < 300;

           lastPointerDown.current = now;

           if (isDoubleClick) {
             onDoubleClick?.();
             return;
           }

           e.currentTarget.setPointerCapture(e.pointerId);
           updatePointer(e.clientY);
         }}
         onPointerMove={(e) => {
           if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
           updatePointer(e.clientY);
         }}
         onPointerUp={(e) => {
           e.currentTarget.releasePointerCapture(e.pointerId);
           onCommit();
         }}
         onPointerCancel={onCommit}
         onKeyDown={(e) => {
           const currentDb = sliderToDb(value);
           const step = 0.5;

           if (e.key === "ArrowUp" || e.key === "ArrowRight") {
             e.preventDefault();
             onChange(Math.min(1, dbToSlider(currentDb + step)));
             onCommit();
           }

           if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
             e.preventDefault();
             onChange(Math.max(0, dbToSlider(currentDb - step)));
             onCommit();
           }
         }}>
      <div ref={trackRef} className={s.faderTrack}>
        <div className={s.faderThumb} style={{bottom: `${value * 100}%`}}/>
      </div>
    </div>
  );
};

export default Fader;