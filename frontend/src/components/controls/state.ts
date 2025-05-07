import {AudioProvider, PlaybackState} from "../../audio/types.ts";

export interface ProviderControlState {
    isConnected: boolean;
    isConnecting: boolean;
    hasCredentials: boolean;
    playbackState: PlaybackState | null;
}

export interface ControlsState {
    providerStates: Record<AudioProvider, ProviderControlState>;
}

export const ControlsStateInitial: ProviderControlState = {
    isConnected: false,
    isConnecting: false,
    hasCredentials: false,
    playbackState: null,
}

export const ControlsStateDefault: ControlsState = {
    providerStates: {
        [AudioProvider.Spotify]: ControlsStateInitial
    }
};
