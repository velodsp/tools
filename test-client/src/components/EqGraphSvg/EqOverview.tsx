import {type WheelEvent, type FC, useMemo, useState} from "react";
import EqGraphSvg, {type PlotArea} from "./EqGraphSvg.tsx";
import {TbZoomReset} from "react-icons/tb";
import type {DspInput, DspOutput} from "../../dsp/protocol.ts";
import {dbToY, frequencyToX, SAMPLE_RATE} from "../../utils/eqUtils.ts";
import s from "./EqGraphSvg.module.css";

const MIN_HZ = 10;
const MAX_HZ = 20_000;

const DEFAULT_MAX_ABS_DB = 16;
const MIN_MAX_ABS_DB = 4;
const MAX_MAX_ABS_DB = 40;
const DB_ZOOM_STEP = 2;

const margin = {
  top: 28,
  right: 24,
  bottom: 36,
  left: 52
};

interface EqGraphProps {
  channel: DspInput | DspOutput;
  width?: number;
  height?: number;
  chNumber: number;
}

const formatFrequency = (frequencyHz: number) => {
  if (frequencyHz >= 1000) {
    return `${frequencyHz / 1000}k`;
  }

  return `${frequencyHz}`;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createGainGrid = (maxAbsDb: number, targetTickCount = 9) => {
  const fullRange = maxAbsDb * 2;
  const rawStep = fullRange / (targetTickCount - 1);

  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalizedStep = rawStep / magnitude;

  let niceNormalizedStep: number;

  if (normalizedStep <= 1) niceNormalizedStep = 2;
  else if (normalizedStep <= 2) niceNormalizedStep = 2;
  else if (normalizedStep <= 5) niceNormalizedStep = 4;
  else niceNormalizedStep = 10;

  const step = niceNormalizedStep * magnitude;
  const ticks: number[] = [];

  for (let gainDb = 0; gainDb <= maxAbsDb; gainDb += step) {
    ticks.push(gainDb);

    if (gainDb !== 0) {
      ticks.push(-gainDb);
    }
  }

  return ticks.sort((a, b) => a - b);
};

const EqOverview: FC<EqGraphProps> = ({channel, width = 900, height = 520}) => {
  const [maxAbsDb, setMaxAbsDb] = useState(DEFAULT_MAX_ABS_DB);

  const minDb = -maxAbsDb;
  const maxDb = maxAbsDb;
  const gainGrid = useMemo(() => createGainGrid(maxAbsDb), [maxAbsDb]);

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    const direction = event.deltaY < 0 ? -1 : 1;

    setMaxAbsDb(current =>
      clamp(
        current + direction * DB_ZOOM_STEP,
        MIN_MAX_ABS_DB,
        MAX_MAX_ABS_DB
      )
    );
  };

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const plotArea: PlotArea = {
    x: margin.left,
    y: margin.top,
    width: plotWidth,
    height: plotHeight
  };

  const frequencyGrid = [10, 20, 40, 60, 80, 100, 200, 400, 600, 800, 1000, 2000, 4000, 6_000, 8000, 10_000, 20_000];

  return (
    <div className={s.eqOverview}>
      <div className={s.controls}>
        <div className={s.zoom} onClick={() => setMaxAbsDb(DEFAULT_MAX_ABS_DB)}>
          {maxAbsDb !== DEFAULT_MAX_ABS_DB && <><TbZoomReset/><p>Reset zoom</p></>}
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`}
           role={"img"} aria-label={`Frequency response, ${minDb} to ${maxDb} decibels`}
           style={{display: "block", width: "100%", height: "100%"}}
           onWheel={handleWheel}
      >
        <rect x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} fill={"transparent"}/>

        {frequencyGrid.map((frequencyHz) => {
          const x = margin.left + frequencyToX(frequencyHz, MIN_HZ, MAX_HZ, plotWidth);

          return (
            <g key={frequencyHz}>
              <line
                x1={x}
                x2={x}
                y1={margin.top}
                y2={margin.top + plotHeight}
                stroke="white"
                strokeWidth={1}
                strokeOpacity={0.15}
                vectorEffect="non-scaling-stroke"
              />

              <text
                x={x}
                y={margin.top + plotHeight + 18}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={"0.6rem"}
                fill="white"
                opacity={0.7}
              >
                {formatFrequency(frequencyHz)}
              </text>
            </g>
          );
        })}

        {gainGrid.map((gainDb) => {
          const y = margin.top + dbToY(gainDb, minDb, maxDb, plotHeight);

          return (
            <g key={gainDb}>
              <line
                x1={margin.left}
                x2={margin.left + plotWidth}
                y1={y}
                y2={y}
                stroke="white"
                strokeOpacity={gainDb === 0 ? 0.35 : 0.15}
                strokeWidth={gainDb === 0 ? 1.5 : 1}
                vectorEffect="non-scaling-stroke"
              />

              <text
                x={margin.left - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={"0.6rem"}
                fill="white"
                opacity={0.7}
              >
                {gainDb > 0 ? `+${gainDb}` : gainDb} dB
              </text>
            </g>
          );
        })}

        <EqGraphSvg MAX_DB={maxDb}
                    MIN_DB={minDb}
                    MIN_HZ={MIN_HZ}
                    MAX_HZ={MAX_HZ}
                    SAMPLE_RATE={SAMPLE_RATE}
                    peq={channel.peq}
                    plotArea={plotArea}
        />
      </svg>
    </div>
  );
};

export default EqOverview;