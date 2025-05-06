import {PlaybackState} from "../audio/types.ts";

export interface AudioSourceControlState {
    isConnected: boolean;
    playbackState: PlaybackState | null;
}

export interface ControlsState {
    audioSources: Record<string, AudioSourceControlState>;
}

export const ControlsStateDefault: ControlsState = {
    audioSources: {}
};
