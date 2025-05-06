import {PlaybackSource, PlaybackEvents, PlaybackState} from '../types.ts';

export class SpotifyPlayback implements PlaybackSource {
    private player: Spotify.Player | null = null;
    private playbackState: Spotify.PlaybackState | null = null;
    private events: PlaybackEvents;
    private token: string | null = null;

    constructor(events: PlaybackEvents, token: string) {
        this.events = events;
        this.token = token;
    }

    get name(): string {
        return 'Spotify';
    }

    get isConnected(): boolean {
        return this.player !== null;
    }

    async connect(): Promise<void> {
        // Check if we have a valid token
        if (!this.token) {
            const error = new Error('Cannot connect to Spotify: No authentication token available');
            this.events.onError?.(error);
            throw error;
        }

        // Load Spotify SDK script if not already loaded
        if (!window.Spotify) {
            await this.loadSpotifyScript();
        }

        return new Promise((resolve, reject) => {
            const player = new window.Spotify.Player({
                name: 'Drumbot',
                getOAuthToken: cb => cb(this.token!),
                volume: 1.0
            });

            player.addListener('ready', ({device_id}) => {
                console.log('Ready with Device ID', device_id);
                this.player = player;
                this.events.onConnectionChange?.(true);
                resolve();
            });

            player.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
                this.player = null;
                this.events.onConnectionChange?.(false);
            });

            player.addListener('player_state_changed', state => {
                console.log('Player state changed', state);
                this.playbackState = state;
                this.events.onPlaybackStateChange?.(this.convertPlaybackState(state));
            });

            player.connect()
                .then(success => {
                    if (success) {
                        console.log('The Web Playback SDK successfully connected to Spotify!');
                    }
                })
                .catch(error => {
                    this.events.onError?.(new Error(`Failed to connect to Spotify: ${error}`));
                    reject(error);
                });
        });
    }

    async disconnect(): Promise<void> {
        this.player?.disconnect();
        this.player = null;
        this.events.onConnectionChange?.(false);
    }

    async getPlaybackState(): Promise<PlaybackState> {
        if (!this.playbackState) {
            throw new Error('No playback state available');
        }
        return this.convertPlaybackState(this.playbackState);
    }

    private convertPlaybackState(state: Spotify.PlaybackState): PlaybackState {
        return {
            isPlaying: !state.paused,
            currentTrack: {
                id: state.track_window.current_track.id || '',
                name: state.track_window.current_track.name,
                albumName: state.track_window.current_track.album.name,
                albumArtUrl: state.track_window.current_track.album.images.sort(
                    (a, b) => (b.width ?? 0) - (a.width ?? 0)
                )[0].url,
                artist: state.track_window.current_track.artists[0].name,
                duration: state.duration
            },
            startedTimestamp: state.timestamp,
            position: state.position,
            duration: state.duration
        };
    }

    async play(trackId: string): Promise<void> {
        if (!this.player) {
            throw new Error('Player not connected');
        }

        throw new Error('Not implemented');
    }

    private async loadSpotifyScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Add a timeout to reject the Promise if the script takes too long to load
            const timeoutId = setTimeout(() => {
                reject(new Error('Timeout loading Spotify SDK'));
            }, 10000); // 10 seconds timeout

            // Set up the callback that Spotify SDK will call when ready
            window.onSpotifyWebPlaybackSDKReady = () => {
                clearTimeout(timeoutId);
                resolve();
            };

            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;

            // Add proper error handling
            script.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error('Failed to load Spotify SDK'));
            };

            document.body.appendChild(script);
        });
    }


}
