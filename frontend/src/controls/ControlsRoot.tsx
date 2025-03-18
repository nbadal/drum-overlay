import {useEffect, useState} from "react";
import {Events} from "@wailsio/runtime";
import {ControlsState, ControlsStateDefault} from "./state.ts";
import {WailsEventType} from "../events.ts";
import {PlaybackStatusControl} from "./PlaybackStatusControl.tsx";

function ControlsRoot() {
    const [controlsState, setControlsState] = useState<ControlsState>(ControlsStateDefault);

    useEffect(() => {
        Events.On('controls-state', (e: WailsEventType<ControlsState>) => {
            setControlsState(e.data);
        });

        return () => {
            Events.Off('controls-state');
        }
    });

    return (
        <div className="Controls">
            {controlsState && (
                <ControlsContent state={controlsState}/>
            )}
        </div>
    );
}

function ControlsContent(props: { state: ControlsState }) {
    const doSpotifyLogin = async () => {
        await Events.Emit({name: 'control-spotify-connect', data: {}});
    }
    const resetNotes = async () => {
        await Events.Emit({name: 'control-reset-notes', data: {}});
    }
    return (
        <div>
            <button onClick={doSpotifyLogin} disabled={props.state.spotifyAuthenticated}>
                Spotify{props.state.spotifyAuthenticated ? " Connected" : ""}
            </button>
            <PlaybackStatusControl playbackState={props.state.spotifyPlaybackState}/>
            <button onClick={resetNotes}>Reset Notes</button>
        </div>
    );
}

export default ControlsRoot;
