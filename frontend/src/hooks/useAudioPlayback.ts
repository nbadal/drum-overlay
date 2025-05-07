import {useEffect, useState} from 'react';
import {SpotifyPlayback} from '../audio/spotify/playback.ts';
import {AudioProvider, PlaybackState} from '../audio/types';
import {Events} from "@wailsio/runtime";
import {sourcePlaybackManager} from "../audio/SourcePlaybackManager.ts";
import {ProviderCredentials} from "./useAudioAuth.ts";

export type ProviderPlaybacks = Map<AudioProvider, PlaybackState | undefined>

export function useAudioPlayback(credentials: ProviderCredentials): ProviderPlaybacks {
    const [playbackStates, setPlaybackStates] = useState<ProviderPlaybacks>(() => new Map());
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
            sourcePlaybackManager.disconnect(AudioProvider.Spotify).catch(console.error);
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

    return playbackStates;
}
