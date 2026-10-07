import {type FC, useMemo} from "react";
import type {Peq} from "../../dsp/protocol.ts";
import {combinedResponseDb, createLogFrequencies, dbToY, frequencyToX} from "../../utils/eqUtils.ts";


const MIN_HZ = 10;
const MAX_HZ = 20_000;

const DEFAULT_MAX_ABS_DB = 16;
const MIN_DB = -DEFAULT_MAX_ABS_DB;
const MAX_DB = DEFAULT_MAX_ABS_DB;

const SAMPLE_RATE = 48_000;

interface EqGraphProps {
  peq: Peq;
}

const EqPreview: FC<EqGraphProps> = ({peq}) => {
  const frequencies = useMemo(() => createLogFrequencies(MIN_HZ, MAX_HZ, 200), [MIN_HZ, MAX_HZ]);

  const path = frequencies
    .map((frequencyHz, index) => {
      const db = combinedResponseDb(peq.bands, frequencyHz, SAMPLE_RATE);

      const x = frequencyToX(frequencyHz, MIN_HZ, MAX_HZ, 100);
      const y = dbToY(db, MIN_DB, MAX_DB, 40);

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      aria-label="EQ frequency response"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default EqPreview;
