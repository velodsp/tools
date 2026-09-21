export type ChannelType = "input" | "output";

export interface ChannelTarget {
  channel_type: ChannelType;
  channel: number;
}

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

export interface HelloMessage {
  type: "hello";
  protocol_version: number;
  firmware_version: string;
  revision: number;
  state: DspState;
}

export interface OkResponse {
  id: number;
  type: "ok";
  revision: number;
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

export interface ChannelGainChange extends ChannelTarget {
  type: "channel_gain";
  gain_db: number;
}

export interface SetChannelGainRequest extends ChannelTarget {
  type: "set_channel_gain";
  id: number;
  gain_db: number;
}

export interface PresetModifiedChange {
  type: "preset_modified";
  value: boolean;
}

export type DspStateChange =
  | ChannelGainChange
  | PresetModifiedChange;

export interface StateUpdateMessage {
  type: "state_update";
  revision: number;
  changes: DspStateChange[];
}

export type DspRequest =
  | SetChannelGainRequest;

export type DspResponse =
  | OkResponse
  | ErrorResponse;

export type DspMessage =
  | HelloMessage
  | DspResponse
  | StateUpdateMessage;

export const inputTarget = (channel: number): ChannelTarget => ({
  channel_type: "input",
  channel
});

export const outputTarget = (channel: number): ChannelTarget => ({
  channel_type: "output",
  channel
});
