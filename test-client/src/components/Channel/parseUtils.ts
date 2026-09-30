import {MAX_GAIN_DB, MIN_GAIN_DB} from "./sliderMappingUtils.ts";

export function parseDbInput(input: string) {
  const normalized = input.trim().replace(",", ".");

  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);

  if(value < MIN_GAIN_DB) return MIN_GAIN_DB;
  if(value > MAX_GAIN_DB) return MAX_GAIN_DB;

  return Number.isFinite(value) ? value : null;
}
