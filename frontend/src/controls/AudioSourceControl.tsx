import {MusicNote} from "@mui/icons-material";
import React from "react";
import Button from "@mui/material/Button";
import {PlaybackStatusControl} from "./PlaybackStatusControl.tsx";
import {AudioSourceControlState} from "./state.ts";

interface AudioSourceControlProps {
    name: string;
    state: AudioSourceControlState;
    onConnectRequest: () => void;
}

export function AudioSourceControl({name, state, onConnectRequest}: AudioSourceControlProps) {
    return (
        <div className="audio-source-control">
            <ControlsButton
                text={`${name}${state.isConnected ? " Connected" : ""}`}
                onClick={onConnectRequest}
                disabled={state.isConnected}
                icon={<MusicNote/>}
            />
            {state.playbackState && (
                <PlaybackStatusControl playbackState={state.playbackState}/>
            )}
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
