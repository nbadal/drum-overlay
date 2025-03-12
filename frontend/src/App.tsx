import {useEffect, useState} from 'react'
import {Events, WML} from "@wailsio/runtime";
import {AuthenticationResponse, SpotifyApi} from "@spotify/web-api-ts-sdk";
import WailsRedirectionStrategy from "./spotify-redirect.ts";
import {SpotifyService} from "../bindings/drumbot";
import {motion} from "motion/react"
import {useSpotifyWebPlayerApi} from "./spotify-events.ts";

interface SpotifyState {
    api: SpotifyApi,
    auth: AuthenticationResponse,
}

async function doSpotifyAuth(serverPort: number): Promise<SpotifyState> {
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

interface Note {
    note: number,
    velocity: number,
}

const td50NoteMap: { [key: number]: string } = {
    26: "Hi-Hat Edge",
    33: "AUX EDGE",
    34: "AUX",
    36: "Kick",
    37: "Snare X-Stick",
    38: "Snare",
    39: "Tom 3 Rim",
    40: "Snare Rim",
    41: "Tom 3",
    43: "Tom 2",
    44: "Hi-Hat Pedal",
    46: "Hi-Hat",
    48: "Tom 1",
    49: "Crash 1",
    50: "Tom 1 Rim",
    51: "Ride",
    52: "Crash 2 Edge",
    53: "Ride Bell",
    55: "Crash 1 Edge",
    57: "Crash 2",
    58: "Tom 2 Rim",
    59: "Ride Edge",
}

function App() {
    const [spotify, setSpotify] = useState<SpotifyState | null>(null);
    const doSpotifyLogin = () => {
        (async () => {
            if (spotify) {
                // Already authenticated
                return;
            }
            const serverPort = await SpotifyService.StartCallbackServer();
            console.log("Server started on port: " + serverPort);

            const api = await doSpotifyAuth(serverPort);
            setSpotify(api);
        })().then(() => {
                console.log("Spotify Auth Started");
            }
        ).catch((err: any) => {
                console.log(err);
            }
        );
    }
    const [spotifyPlayer, playbackState] = useSpotifyWebPlayerApi(spotify?.auth?.accessToken?.access_token);

    const [allNotes, setAllNotes] = useState<Note[]>([]);

    useEffect(() => {
        console.log("Setting up event listeners");
        Events.On('note', (timeValue: any) => {
            setAllNotes(prev => [...prev, {
                note: timeValue.data[0].Note,
                velocity: timeValue.data[0].Velocity
            }]);
        });
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

                    setSpotify(api);
                }
            ).catch(
                (err: any) => console.log(err)
            );
        });
        // Reload WML so it picks up the wml tags
        WML.Reload();

        return () => {
            console.log("Removing event listeners");
            Events.Off('note');
            Events.Off('spotify-callback');
        }
    }, []);

    const [trackingSong, setTrackingSong] = useState<string | null>(null);
    useEffect(() => {
        const song = playbackState?.track_window.current_track.id;
        if (song && song !== trackingSong) {
            setTrackingSong(song);
            console.log("Now tracking song:", song);
        }
    }, [playbackState]);

    useEffect(() => {
        // Each time the tracking song changes, print totals, reset.
        if (!trackingSong) {
            return;
        }
        console.log("Song:", trackingSong);
        console.log("Notes:", allNotes.length);
        setAllNotes([]);
    }, [trackingSong]);

    return (
        <>
            <div className="App">
                <div>
                    {!!spotify || <button onClick={doSpotifyLogin}>Spotify</button>}
                    <button onClick={() => setAllNotes([])}>Reset</button>
                </div>
                {spotifyPlayer && (
                    <div>Player Connected!</div>
                )}
                {playbackState && (
                    <div>
                        <div>Playing: {playbackState.track_window.current_track.name}</div>
                        <div>Artist: {playbackState.track_window.current_track.artists[0].name}</div>
                        <div>Progress: {playbackState.position} / {playbackState.duration}</div>
                    </div>
                )}
                <div className="notes">
                    {Object.entries(td50NoteMap).map(([note, name]) => {
                        let notesForKey = allNotes.filter(n => note === "" + n.note);
                        if (notesForKey.length === 0) {
                            return null;
                        }
                        return <NoteView
                            key={name}
                            name={name}
                            lastVelocity={notesForKey[notesForKey.length - 1].velocity}
                            noteCount={notesForKey.length}/>
                    })}
                </div>
                <div>{allNotes.length} total notes</div>
            </div>
            <span className="Corner" style={{top: 0, left: 0}}/>
            <span className="Corner" style={{top: 0, right: 0}}/>
            <span className="Corner" style={{bottom: 20, left: 0}}/>
            <span className="Corner" style={{bottom: 20, right: 0}}/>
        </>
    )
}


const NoteView = (props: { name: string, noteCount: number, lastVelocity: number }) => {
    let brightness = props.lastVelocity / 2 + 192; // Range of 192-255
    return (
        <motion.div
            key={props.name + props.noteCount}
            className="note-circle"
            initial={{backgroundColor: "rgb(" + brightness + ", " + brightness + ", " + brightness + ")"}}
            animate={{backgroundColor: "rgb(64, 64, 64)"}}
            transition={{duration: 0.3}} // Smooth fade
        >
            {props.name}<br/> {props.noteCount}
        </motion.div>
    );
};

export default App
