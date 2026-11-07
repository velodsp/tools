export const MIN_CHANNEL_GAIN_DB = -80;
export const MAX_CHANNEL_GAIN_DB = 12;

export const MIN_PEQ_GAIN_DB = -24;
export const MAX_PEQ_GAIN_DB = 24;

export const sliderToDb = (value: number) => {
  if (value < 0.35) {
    const t = value / 0.35;
    return MIN_CHANNEL_GAIN_DB + 60 * Math.pow(t, 0.6);
  }

  if (value < 0.75) {
    const t = (value - 0.35) / 0.4;
    return -20 + 20 * t;
  }

  const t = (value - 0.75) / 0.25;
  return MAX_CHANNEL_GAIN_DB * t;
};

export function dbToSlider(db: number) {
  if (db < -20) {
    const t = Math.pow((db - MIN_CHANNEL_GAIN_DB) / 60, 1 / 0.6);
    return 0.35 * t;
  }

  if (db < 0) {
    const t = (db + 20) / 20;
    return 0.35 + 0.4 * t;
  }

  const t = db / MAX_CHANNEL_GAIN_DB;
  return 0.75 + 0.25 * t;
}
