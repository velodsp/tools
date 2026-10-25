import {type FC, useId, useMemo} from "react";
import {combinedResponseDb, createLogFrequencies, dbToY, frequencyToX} from "../../utils/eqUtils.ts";
import type {Peq, PeqBand} from "../../dsp/protocol.ts";

interface EqGraphProps {
  peq: Peq;
  plotArea: PlotArea;
  MIN_HZ: number;
  MAX_HZ: number;
  MIN_DB: number;
  MAX_DB: number;
  SAMPLE_RATE: number;
}

export interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EqGraphSvg: FC<EqGraphProps> = ({peq, plotArea, MIN_HZ, MIN_DB, MAX_DB, MAX_HZ, SAMPLE_RATE}) => {
  const clipId = useId();
  const frequencies = useMemo(() => createLogFrequencies(MIN_HZ, MAX_HZ, 1000), [MIN_HZ, MAX_HZ]);

  const createEqPath = (bands: PeqBand[]) => {
    return frequencies
      .map((frequencyHz, index) => {
        const responseDb = combinedResponseDb(bands, frequencyHz, SAMPLE_RATE);

        const x = plotArea.x + frequencyToX(frequencyHz, MIN_HZ, MAX_HZ, plotArea.width);
        const y = plotArea.y + dbToY(responseDb, MIN_DB, MAX_DB, plotArea.height);

        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  };

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect
            x={plotArea.x}
            y={plotArea.y}
            width={plotArea.width}
            height={plotArea.height}
          />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <path
          d={createEqPath(peq.bands)}
          fill="none"
          stroke={"currentColor"}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </>
  );
};

export default EqGraphSvg;