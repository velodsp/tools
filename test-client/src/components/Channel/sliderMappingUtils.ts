export const sliderToDb = (value: number) => {
  if (value < 0.35) {
    const t = value / 0.35;
    return -80 + 60 * Math.pow(t, 0.6);
  }

  if (value < 0.75) {
    const t = (value - 0.35) / 0.4;
    return -20 + 20 * t;
  }

  const t = (value - 0.75) / 0.25;
  return 12 * t;
};

export function dbToSlider(db: number) {
  if (db < -20) {
    const t = Math.pow((db + 80) / 60, 1 / 0.6);
    return 0.35 * t;
  }

  if (db < 0) {
    const t = (db + 20) / 20;
    return 0.35 + 0.4 * t;
  }

  const t = db / 12;
  return 0.75 + 0.25 * t;
}
