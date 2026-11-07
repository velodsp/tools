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

export const MIN_PEQ_Q = 0.1;
export const MAX_PEQ_Q = 51;

export function parseQInput(input: string, minQ: number, maxQ: number) {
  const normalized = input.trim().replace(",", ".");

  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);

  if(value < minQ) return minQ;
  if(value > maxQ) return maxQ;

  return Number.isFinite(value) ? value : null;
}

export function formatQ(q: number) {
  return `${Math.round(q * 100) / 100}`;
}

export const MIN_PEQ_HZ = 10;
export const MAX_PEQ_HZ = 20000;

export function parseHzInput(input: string, minHz: number, maxHz: number) {
  const normalized = input.trim().replace(",", ".");

  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);

  if(value < minHz) return minHz;
  if(value > maxHz) return maxHz;

  return Number.isFinite(value) ? value : null;
}

export function formatHz(hz: number) {
  return `${Math.round(hz * 10) / 10}`;
}

