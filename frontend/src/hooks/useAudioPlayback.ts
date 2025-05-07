import {useEffect, useState} from 'react';
import {SourcePlaybackManager as AudioSourceManager} from '../audio/SourcePlaybackManager.ts';
import {SpotifyPlayback as SpotifyAudioSource} from '../audio/spotify/playback.ts';
import {AudioProvider, AuthCredentials, PlaybackState} from '../audio/types';

export function useAudioPlayback(credentials: { [source in AudioProvider]: AuthCredentials | null }) {
    const [sourceManager] = useState(() => new AudioSourceManager());
    const [playbackStates, setPlaybackStates] = useState<Map<AudioProvider, PlaybackState | undefined>>(() => new Map());
    const [activeSource, setActiveSource] = useState<AudioProvider | null>(null);

    // Clean up the source manager when the component is unmounted
    useEffect(() => {
        return () => {
            sourceManager.cleanup();
        };
    }, [sourceManager]);

    useEffect(() => {
        const spotifyCredentials = credentials[AudioProvider.Spotify];
        if (!spotifyCredentials) return;

        const spotifySource = new SpotifyAudioSource({
            onPlaybackStateChange: (state) => {
                console.log(`Spotify playback state updated: ${state.isPlaying ? 'playing' : 'paused'}`);
                setPlaybackStates(prev => {
                    const newMap = new Map(prev);
                    newMap.set(AudioProvider.Spotify, state);
                    return newMap;
                });
            },
            onConnectionChange: (connected) => {
                console.log(`Spotify connection state: ${connected}`);
                if (!connected) {
                    if (activeSource === AudioProvider.Spotify) {
                        setActiveSource(null);
                    }
                    setPlaybackStates(prev => {
                        const newMap = new Map(prev);
                        newMap.set(AudioProvider.Spotify, undefined);
                        return newMap;
                    });
                }
            },
            onError: (error) => {
                console.error('Spotify error:', error);
            }
        }, spotifyCredentials.accessToken);

        sourceManager.registerSource(spotifySource);
        sourceManager.connect(AudioProvider.Spotify)
            .then(() => {
                setActiveSource(AudioProvider.Spotify);
            })
            .catch(console.error);

        return () => {
            spotifySource.disconnect().catch(console.error);
        };
    }, [credentials]);

    return {
        sourceManager,
        playbackStates,
        playbackSources: sourceManager.getPlaybackSources(),
        activeProvider: sourceManager.getActiveProvider(),
        activePlaybackState: activeSource ? playbackStates.get(activeSource) ?? null : null
    };
}
