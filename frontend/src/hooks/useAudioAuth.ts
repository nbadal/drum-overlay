import {useEffect, useState} from 'react';
import {sourceAuthManager} from "../audio/SourceAuthManager.ts";
import {SpotifyAuthStrategy} from "../audio/spotify/auth.ts";
import {AudioProvider, AuthCredentials} from "../audio/types.ts";
import {Events} from "@wailsio/runtime";

export type ProviderCredentials = {
    [source in AudioProvider]: AuthCredentials | null;
}

export function useAudioAuth() {
    const [credentials, setCredentials] = useState<ProviderCredentials>({
        [AudioProvider.Spotify]: null,
    });

    useEffect(() => {
        sourceAuthManager.registerStrategy(new SpotifyAuthStrategy({
            onAuthStateChange: (spotifyCreds) => {
                console.log('Spotify auth state changed:', credentials);
                if (spotifyCreds) {
                    setCredentials(prev => ({...prev, ['Spotify']: spotifyCreds}));
                } else {
                    setCredentials(prev => ({...prev, ['Spotify']: null}));
                }
            },
            onError: (error) => {
                console.error('Auth error:', error);
            }
        }));
    }, []);

    // Initialize with any existing credentials
    useEffect(() => {
        const allCreds: { [source in AudioProvider]: AuthCredentials | null; } = {
            [AudioProvider.Spotify]: null,
        }
        for (const provider of Object.values(AudioProvider)) {
            const creds = sourceAuthManager.getCredentials(provider);
            if (creds) {
                allCreds[provider] = creds;
            }
        }
        setCredentials(allCreds);
    }, []);

    // Add event listener for control-source-auth
    useEffect(() => {
        Events.On('control-source-auth', async (data: any) => {
            const sourceName = data.data.sourceName;
            try {
                if (!sourceAuthManager.isAuthenticated(sourceName)) {
                    await sourceAuthManager.authenticate(sourceName);
                } else {
                    console.log(`Already authenticated with ${sourceName}`);
                }
            } catch (error) {
                console.error(`Failed to authenticate with ${sourceName}:`, error);
            }
        });

        return () => {
            Events.Off('control-source-auth');
        };
    }, []);

    return credentials;
}
