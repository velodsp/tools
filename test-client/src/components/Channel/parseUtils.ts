export function parseDbInput(input: string) {
  const normalized = input.trim().replace(",", ".");

  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);

  return Number.isFinite(value) ? value : null;
}

export function parseGainDb(input: string) {
  const value = parseDbInput(input);

  if(value === null) return null;
  if(value < -96 || value > 12) return null;

  return value;
}
