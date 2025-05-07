import {useEffect, useState} from 'react';
import {SourceAuthManager} from "../audio/SourceAuthManager.ts";
import {SpotifyAuthStrategy} from "../audio/spotify/auth.ts";
import {AudioProvider, AuthCredentials} from "../audio/types.ts";
import {Events} from "@wailsio/runtime";

export function useAudioAuth() {
    const [credentials, setCredentials] = useState<{
        [source in AudioProvider]: AuthCredentials | null;
    }>({
        [AudioProvider.Spotify]: null,
    });

    const [authManager] = useState(() => {
        const manager = new SourceAuthManager();
        manager.registerStrategy(new SpotifyAuthStrategy({
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
        return manager;
    });

    // Initialize with any existing credentials
    useEffect(() => {
        const allCreds: { [source in AudioProvider]: AuthCredentials | null; } = {
            [AudioProvider.Spotify]: null,
        }
        for (const source in AudioProvider) {
            const creds = authManager.getCredentials(source);
            if (creds) {
                allCreds[source] = creds;
            }
        }
        setCredentials(allCreds);
    }, [authManager]);

    // Add event listener for control-source-auth
    useEffect(() => {
        Events.On('control-source-auth', async (data: any) => {
            const sourceName = data.data.sourceName;
            console.log(`Starting ${sourceName} Auth`);
            try {
                if (!authManager.isAuthenticated(sourceName)) {
                    await authManager.authenticate(sourceName);
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
    }, [authManager]);

    return {
        authManager,
        credentials,
        isAuthenticated: (source: string) => authManager.isAuthenticated(source),
        authenticate: async (source: string) => {
            const creds = await authManager.authenticate(source);
            setCredentials(prev => ({...prev, [source]: creds}));
        },
        disconnect: async (source: string) => {
            await authManager.disconnect(source);
            setCredentials(prev => {
                const next = {...prev};
                delete next[source];
                return next;
            });
        }
    };
}
