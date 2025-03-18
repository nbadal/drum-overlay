import {useEffect, useState} from "react";
import {AuthenticationResponse, SpotifyApi} from "@spotify/web-api-ts-sdk";
import {SpotifyService} from "../../bindings/drumbot";
import {useSpotifyWebPlayerApi} from "../spotify-events.ts";
import {Events} from "@wailsio/runtime";
import WailsRedirectionStrategy from "../spotify-redirect.ts";
import {useControlsDispatch} from "./ControlsContext.tsx";

export interface SpotifyAuthState {
    api: SpotifyApi,
    auth: AuthenticationResponse,
}

export interface SpotifyPlayerState {
    player: Spotify.Player,
    playbackState: Spotify.PlaybackState,
}

async function doSpotifyAuth(serverPort: number): Promise<SpotifyAuthState> {
    const api = SpotifyApi.withUserAuthorization(
        "cdc7f38bf9b84bc9aab2e78461d91638",
        `http://127.0.0.1:${serverPort}/spotify-callback`,
        ["user-read-private", "user-read-email", "user-read-playback-state", "user-modify-playback-state", "streaming"],
        {
            redirectionStrategy: new WailsRedirectionStrategy(),
        }
    );
    const auth = await api.authenticate();
    return {
        api: api,
        auth: auth,
    };
}

export function useSpotifyState(): [SpotifyAuthState | null, SpotifyPlayerState | null] {
    const [authState, setAuthState] = useState<SpotifyAuthState | null>(null);
    // Update controls etc.
    const controlsDispatch = useControlsDispatch();
    useEffect(() => {
        controlsDispatch({type: "SET_SPOTIFY_AUTHENTICATED", hasAuth: !!authState});
    }, [authState]);

    const [spotifyPlayer, playbackState] = useSpotifyWebPlayerApi(authState?.auth?.accessToken?.access_token);
    // Update controls etc.
    useEffect(() => {
        controlsDispatch({type: "SET_SPOTIFY_PLAYBACK_STATE", playbackState: playbackState});
    }, [playbackState]);


    useEffect(() => {
        Events.On('spotify-callback', (data: any) => {
            console.log("Spotify Callback", data);
            console.log("Spotify Code", data.data[0].code);
            console.log("Spotify Port", data.data[0].originalPort);

            // Inject the `code` into our query string
            const url = new URL(window.location.href);
            url.searchParams.set('code', data.data[0].code);
            window.history.pushState({}, '', url.toString());

            // Re-authenticate with Spotify
            doSpotifyAuth(data.data[0].originalPort).then((api) => {
                    console.log("Re-authenticated with Spotify");
                    // Clear the code from the query string
                    url.searchParams.delete('code');
                    window.history.pushState({}, '', url.toString());

                    setAuthState(api);
                }
            ).catch(
                (err: any) => console.log(err)
            );
        });
        Events.On('control-spotify-connect', () => {
            console.log("Starting Spotify Auth");
            (async () => {
                if (authState) {
                    // Already authenticated
                    return;
                }
                const serverPort = await SpotifyService.StartCallbackServer();
                console.log("Server started on port: " + serverPort);

                const api = await doSpotifyAuth(serverPort);
                setAuthState(api);
            })().then(() => {
                    console.log("Spotify Auth Started");
                }
            ).catch((err: any) => {
                    console.log(err);
                }
            );
        });

        return () => {
            Events.Off('spotify-callback');
            Events.Off('control-spotify-connect');
        };
    });

    let spotifyPlayerState: SpotifyPlayerState | null = null;
    if (spotifyPlayer && playbackState) {
        spotifyPlayerState = {
            player: spotifyPlayer,
            playbackState: playbackState,
        };
    }
    return [authState, spotifyPlayerState];
}