import {type FC, useRef} from "react";
import s from "./Fader.module.css";
import {dbToSlider, MAX_GAIN_DB, MIN_GAIN_DB, sliderToDb} from "../Channel/sliderMappingUtils.ts";

interface FaderProps {
  value: number;
  onChange: (value: number) => void;
  onCommit: () => void;
  onDoubleClick?: () => void;
}

const Fader: FC<FaderProps> = ({value, onCommit, onChange, onDoubleClick}) => {
  const lastPointerDown = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const keyboardEditing = useRef(false);

  const adjustByDb = (delta: number) => {
    const currentDb = sliderToDb(value);
    const nextDb = Math.max(MIN_GAIN_DB, Math.min(MAX_GAIN_DB, currentDb + delta));

    onChange(dbToSlider(nextDb));
  };

  const updatePointer = (clientY: number) => {
    const track = trackRef.current;
    if (!track) return;

    const rect = track.getBoundingClientRect();
    const clampedY = Math.max(rect.top, Math.min(rect.bottom, clientY));
    const normalized = 1 - (clampedY - rect.top) / rect.height;
    onChange(normalized);
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
           if (e.key === "ArrowUp" || e.key === "ArrowRight") {
             e.preventDefault();
             keyboardEditing.current = true;
             adjustByDb(0.5);
           }

           if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
             e.preventDefault();
             keyboardEditing.current = true;
             adjustByDb(-0.5);
           }
         }}
         onKeyUp={(e) => {
           if (e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft") {
             if (keyboardEditing.current) {
               keyboardEditing.current = false;
               onCommit();
             }
           }
         }}
         onBlur={() => {
           if (keyboardEditing.current) {
             keyboardEditing.current = false;
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