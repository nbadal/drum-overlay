import {useEffect, useState} from 'react';
import {SourcePlaybackManager as AudioSourceManager} from '../audio/SourcePlaybackManager.ts';
import {SpotifyPlayback as SpotifyAudioSource} from '../audio/spotify/playback.ts';
import {AuthCredentials, PlaybackState} from '../audio/types';

export function useAudioPlayback(credentials: Record<string, AuthCredentials>) {
    const [sourceManager] = useState(() => new AudioSourceManager());
    const [playbackStates, setPlaybackStates] = useState<Record<string, PlaybackState | null>>({});
    const [activeSource, setActiveSource] = useState<string | null>(null);

    // Register Spotify source regardless of authentication status
    useEffect(() => {
        // Always create a Spotify source, even if credentials aren't available
        const spotifyCredentials = credentials['Spotify'];
        const events = {
            onPlaybackStateChange: (state) => {
                console.log(`Spotify playback state updated: ${state.isPlaying ? 'playing' : 'paused'}`);
                setPlaybackStates(prev => ({
                    ...prev,
                    'Spotify': state
                }));
            },
            onConnectionChange: (connected) => {
                console.log(`Spotify connection state: ${connected}`);
                if (!connected) {
                    setPlaybackStates(prev => ({
                        ...prev,
                        'Spotify': null
                    }));
                }
            },
            onError: (error) => {
                console.error('Spotify error:', error);
            }
        };

        // Create the source with or without credentials
        let spotifySource;

        // Always create and register the Spotify source
        if (spotifyCredentials) {
            // Create with valid credentials
            spotifySource = new SpotifyAudioSource(events, spotifyCredentials.accessToken);
            sourceManager.registerSource(spotifySource);

            // Try to connect since we have credentials
            sourceManager.connectSource('Spotify')
                .then(() => {
                    setActiveSource('Spotify');
                    // Initial fetch of playback state
                    return spotifySource.getPlaybackState();
                })
                .then(state => {
                    setPlaybackStates(prev => ({
                        ...prev,
                        'Spotify': state
                    }));
                })
                .catch(console.error);
        } else {
            // Register a placeholder source without connecting
            // We use an empty string as token, but connect() will check and fail gracefully
            spotifySource = new SpotifyAudioSource(events, '');
            sourceManager.registerSource(spotifySource);

            // Don't try to connect without credentials
        }

        return () => {
            if (spotifySource && spotifySource.isConnected) {
                spotifySource.disconnect().catch(console.error);
            }
        };
    }, [credentials]);

    return {
        sourceManager,
        activeSource: sourceManager.getActiveSource(),
        playbackStates,
        activePlaybackState: activeSource ? playbackStates[activeSource] : null
    };
}
