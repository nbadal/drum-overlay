import React, {useEffect, useState} from "react";
import {Events} from "@wailsio/runtime";
import {ControlsState, ControlsStateDefault} from "./state.ts";
import {WailsEventType} from "../events.ts";
import {PlaybackStatusControl} from "./PlaybackStatusControl.tsx";
import Button from "@mui/material/Button";
import {MusicNote} from "@mui/icons-material";

function ControlsRoot() {
    const [controlsState, setControlsState] = useState<ControlsState>(ControlsStateDefault);

    useEffect(() => {
        Events.On('controls-state', (e: WailsEventType<ControlsState>) => {
            console.log("Received controls state", e.data);
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
            <ControlsButton
                text={"Spotify" + (props.state.spotifyAuthenticated ? " Connected" : "")}
                onClick={doSpotifyLogin}
                disabled={props.state.spotifyAuthenticated}
                icon={<MusicNote/>}/>
            <PlaybackStatusControl
                playbackState={props.state.spotifyPlaybackState}/>
            <ControlsButton
                text="Reset Notes"
                onClick={resetNotes}/>
        </div>
    );
}

function ControlsButton(props: {
    text: string,
    onClick: () => void,
    icon?: React.ReactNode
    disabled?: boolean,
}) {
    return (
        <Button
            variant="contained"
            onClick={props.onClick}
            startIcon={props.icon}
            disabled={props.disabled}>
            {props.text}
        </Button>
    );
}

export default ControlsRoot;
