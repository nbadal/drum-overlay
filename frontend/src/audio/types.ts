// SOURCES

export enum AudioProvider {
    Spotify = 'Spotify',
}

// PLAYBACK

export interface PlaybackTrack {
    id: string;
    name: string;
    artist: string;
    albumName: string;
    albumArtUrl: string;
    duration: number;
}

export interface PlaybackState {
    isPlaying: boolean;
    currentTrack: PlaybackTrack | null;
    startedTimestamp: number; // Is this naming correct?
    position: number;
    duration: number;
}

export interface PlaybackSource {
    provider: AudioProvider;
    isConnected: boolean;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getPlaybackState(): Promise<PlaybackState>;
    play(trackId: string): Promise<void>;
    // pause(): Promise<void>;
    // resume(): Promise<void>;
    // seek(position: number): Promise<void>;
}

export interface PlaybackEvents {
    onPlaybackStateChange?: (state: PlaybackState) => void;
    onConnectionChange?: (connected: boolean) => void;
    onError?: (error: Error) => void;
}

// AUTH

export interface AuthCredentials {
    [key: string]: any;
}

export interface AuthStrategy {
    readonly provider: AudioProvider;
    authenticate(): Promise<AuthCredentials>;
    disconnect(): Promise<void>;
}

export interface AuthEvents {
    onAuthStateChange?: (credentials: AuthCredentials | null) => void;
    onError?: (error: Error) => void;
}