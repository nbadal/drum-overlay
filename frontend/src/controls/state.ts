export type ControlsState = {
    spotifyAuthenticated: boolean;
    spotifyPlaybackState: Spotify.PlaybackState | null;
};

export const ControlsStateDefault: ControlsState = {
    spotifyAuthenticated: false,
    spotifyPlaybackState: null,
};
