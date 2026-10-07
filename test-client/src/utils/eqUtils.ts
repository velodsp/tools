import type {PeqBand} from "../dsp/protocol.ts";

export function frequencyToX(frequencyHz: number, minHz: number, maxHz: number, width: number) {
  const minLog = Math.log10(minHz);
  const maxLog = Math.log10(maxHz);

  return (
    ((Math.log10(frequencyHz) - minLog) / (maxLog - minLog)) * width
  );
}

export function dbToY(db: number, minDb: number, maxDb: number, height: number) {
  return ((maxDb - db) / (maxDb - minDb)) * height;
}

interface NormalizedBiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export function calculatePeakingCoefficients(frequencyHz: number, gainDb: number, q: number, sampleRate: number): NormalizedBiquadCoefficients {
  // https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html -> peakingEQ (27)

  // clamp frequency to >= 1 and <= sampleRate / 2 - 1, e.g. 48khz -> 1-23999
  const frequency = Math.min(Math.max(frequencyHz, 1), sampleRate / 2 - 1);

  // clamp q to >= 0.001
  const safeQ = Math.max(q, 0.001);

  const omega0 = 2 * Math.PI * (frequency / sampleRate);
  const alpha = Math.sin(omega0) / (2 * safeQ);
  const A = Math.pow(10, gainDb / 40);

  const b0 = 1 + alpha * A;
  const b1 = -2 * Math.cos(omega0);
  const b2 = 1 - alpha * A;

  const a0 = 1 + alpha / A;
  const a1 = -2 * Math.cos(omega0);
  const a2 = 1 - alpha / A;

  return {
    b0: b0 / a0,
    b1: b1 / a0,
    b2: b2 / a0,
    a1: a1 / a0,
    a2: a2 / a0
  };
}

export function biquadMagnitudeDb(coefficients: NormalizedBiquadCoefficients, frequencyHz: number, sampleRate: number) {
  // https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html

  const omega = 2 * Math.PI * frequencyHz / sampleRate;

  const z1Real = Math.cos(omega);
  const z1Imag = -Math.sin(omega);

  const z2Real = Math.cos(2 * omega);
  const z2Imag = -Math.sin(2 * omega);

  const numeratorReal = coefficients.b0 + coefficients.b1 * z1Real + coefficients.b2 * z2Real;
  const numeratorImag = coefficients.b1 * z1Imag + coefficients.b2 * z2Imag;

  const denominatorReal = 1 + coefficients.a1 * z1Real + coefficients.a2 * z2Real;
  const denominatorImag = coefficients.a1 * z1Imag + coefficients.a2 * z2Imag;

  const numeratorMagnitude = Math.sqrt(numeratorReal ** 2 + numeratorImag ** 2);
  const denominatorMagnitude = Math.sqrt(denominatorReal ** 2 + denominatorImag ** 2);

  const safeDenominator = Math.max(denominatorMagnitude, Number.EPSILON);
  const linearMagnitude = numeratorMagnitude / safeDenominator;
  const safeMagnitude = Math.max(linearMagnitude, Number.EPSILON);

  return 20 * Math.log10(safeMagnitude);
}

export function combinedResponseDb(bands: PeqBand[], frequencyHz: number, sampleRate: number) {
  return bands
    .filter(band => band.enabled)
    .reduce((totalDb, band) => {
      if(band.type !== "peak") {
        return totalDb;
      }

      const coefficients = calculatePeakingCoefficients(band.frequency_hz, band.gain_db, band.q, sampleRate);

      return (totalDb + biquadMagnitudeDb(coefficients, frequencyHz, sampleRate));
    }, 0);
}

export function createLogFrequencies(minHz: number, maxHz: number, count: number) {
  const minLog = Math.log10(minHz);
  const maxLog = Math.log10(maxHz);

  return Array.from({length: count}, (_, index) => {
    const ratio = index / Math.max(count - 1, 1);
    return Math.pow(10, minLog + ratio * (maxLog - minLog));
  });
}

export const EQ_HUES = [0, 35, 60, 130, 180, 210, 280, 325];
export const createEqColor = (index: number) => `hsl(${EQ_HUES[index % EQ_HUES.length]} 75% 55%)`;
