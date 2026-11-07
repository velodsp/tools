export function parseDbInput(input: string, minGainDb: number, maxGainDb: number) {
  const normalized = input.trim().replace(",", ".");

  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);

  if(value < minGainDb) return minGainDb;
  if(value > maxGainDb) return maxGainDb;

  return Number.isFinite(value) ? value : null;
}

export function formatDb(gainDb: number) {
  return `${(Math.trunc(gainDb * 10) / 10 <= 0 ? "" : "+")}${gainDb.toFixed(1)}`;
}
