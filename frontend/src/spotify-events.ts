import {useEffect, useState} from "react";

export const useSpotifyWebPlayerApi = (token?: string): [Spotify.Player | null, Spotify.PlaybackState | null] => {
    const [player, setPlayer] = useState<Spotify.Player | null>(null);
    const [playbackState, setPlaybackState] = useState<Spotify.PlaybackState | null>(null);

    useEffect(() => {
        if (!token || token === "emptyAccessToken") {
            return;
        }

        // TODO: Handle case where token changes or is removed etc (we don't want multiple script tags)

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Drumbot',
                getOAuthToken: cb => cb(token),
                volume: 1.0
            });

            setPlayer(player);

            player.addListener('ready', ({device_id}) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({device_id}) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', state => {
                console.log('Player state changed', state);
                setPlaybackState(state);
            });

            player.connect().then(success => {
                if (success) {
                    console.log('The Web Playback SDK successfully connected to Spotify!');
                }
            }).catch(
                (err: any) => console.log(err)
            );
        };
    }, [token]);

    return [player, playbackState];
}
