import {useEffect, useState} from 'react';
import {SpotifyPlayback} from '../audio/spotify/playback.ts';
import {AudioProvider, AuthCredentials, PlaybackState} from '../audio/types';
import {Events} from "@wailsio/runtime";
import {sourcePlaybackManager} from "../audio/SourcePlaybackManager.ts";

export function useAudioPlayback(credentials: { [source in AudioProvider]: AuthCredentials | null }) {
    const [playbackStates, setPlaybackStates] = useState<Map<AudioProvider, PlaybackState | undefined>>(() => new Map());
    const [activeSource, setActiveSource] = useState<AudioProvider | null>(null);

    useEffect(() => {
        const spotifyCredentials = credentials[AudioProvider.Spotify];
        if (!spotifyCredentials) return;

        const spotifySource = new SpotifyPlayback({
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

        sourcePlaybackManager.registerSource(spotifySource);
        sourcePlaybackManager.connect(AudioProvider.Spotify)
            .then(() => {
                setActiveSource(AudioProvider.Spotify);
            })
            .catch(console.error);

        return () => {
            spotifySource.disconnect().catch(console.error);
        };
    }, [credentials]);

    useEffect(() => {
        Events.On('control-source-connect', async (data: any) => {
            const sourceName = data.data.sourceName;
            try {
                await sourcePlaybackManager.connect(sourceName);
            } catch (error) {
                console.error(`Failed to connect to ${sourceName}:`, error);
            }
        });

        return () => {
            Events.Off('control-source-auth');
        };
    }, []);

    return {
        playbackStates,
        activePlaybackState: activeSource ? playbackStates.get(activeSource) ?? null : null
    };
}
