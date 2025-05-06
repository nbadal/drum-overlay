import { useEffect, useState } from 'react';
import {SourceAuthManager} from "../audio/SourceAuthManager.ts";
import {SpotifyAuthStrategy} from "../audio/spotify/auth.ts";
import {AuthCredentials} from "../audio/types.ts";
import {Events} from "@wailsio/runtime";

export function useAudioAuth() {
    const [authManager] = useState(() => {
        const manager = new SourceAuthManager();
        manager.registerStrategy(new SpotifyAuthStrategy({
            onAuthStateChange: (credentials) => {
                // Handle auth state changes
            },
            onError: (error) => {
                console.error('Auth error:', error);
            }
        }));
        return manager;
    });

    const [credentials, setCredentials] = useState<Record<string, AuthCredentials>>({});

    useEffect(() => {
        // Initialize with any existing credentials
        const allCreds: Record<string, AuthCredentials> = {};
        ['Spotify'].forEach(name => {
            const creds = authManager.getCredentials(name);
            if (creds) {
                allCreds[name] = creds;
            }
        });
        setCredentials(allCreds);
    }, [authManager]);

    // Add event listener for control-spotify-connect
    useEffect(() => {
        Events.On('control-spotify-connect', async () => {
            console.log("Starting Spotify Auth");
            try {
                if (!authManager.isAuthenticated('Spotify')) {
                    await authManager.authenticate('Spotify');
                } else {
                    console.log("Already authenticated with Spotify");
                }
            } catch (error) {
                console.error('Failed to authenticate with Spotify:', error);
            }
        });

        return () => {
            Events.Off('control-spotify-connect');
        };
    }, [authManager]);


    return {
        authManager,
        credentials,
        isAuthenticated: (source: string) => authManager.isAuthenticated(source),
        authenticate: async (source: string) => {
            const creds = await authManager.authenticate(source);
            setCredentials(prev => ({ ...prev, [source]: creds }));
        },
        disconnect: async (source: string) => {
            await authManager.disconnect(source);
            setCredentials(prev => {
                const next = { ...prev };
                delete next[source];
                return next;
            });
        }
    };
}