export interface PeqBand {
  enabled: boolean;
  frequency_hz: number;
  gain_db: number;
  q: number;
  type: "peak";
}

export interface DspInput {
  gain_db: number;
  muted: boolean;
  peq: PeqBand[];
}

export interface DspOutput {
  gain_db: number;
  muted: boolean;
  peq: PeqBand[];
}

export interface DspState {
  active_preset: number;
  preset_modified: boolean;

  dsp: {
    inputs: DspInput[];
    outputs: DspOutput[];
  };
}

export interface StateResponse {
  id: number;
  type: "state";
  state: DspState;
}

export interface HelloMessage {
  type: "hello";
  protocol_version: number;
  firmware_version: string;
}

export interface GetStateRequest {
  type: "get_state";
  id: number;
}

export interface SetOutputGainRequest {
  type: "set_output_gain";
  id: number;
  output: number;
  gain_db: number;
}

export interface OkResponse {
  id: number;
  type: "ok";
}

export interface ErrorResponse {
  id: number;
  type: "error";
  error: {
    code: string;
    field?: string;
    message?: string;
  };
}

export type DspRequest =
  | GetStateRequest
  | SetOutputGainRequest;

export type DspResponse =
  | OkResponse
  | ErrorResponse
  | StateResponse;

export type DspMessage =
  | HelloMessage
  | DspResponse;
