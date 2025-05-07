import {MusicNote} from "@mui/icons-material";
import React from "react";
import Button from "@mui/material/Button";
import {PlaybackStatusControl} from "./PlaybackStatusControl.tsx";
import {ProviderControlState} from "./state.ts";

interface AudioSourceControlProps {
    name: string;
    state: ProviderControlState;
    onClick: () => void;
}

export function AudioSourceControl({name, state, onClick}: AudioSourceControlProps) {
    // Determine button text based on connection and auth state
    let buttonText = name;
    if (state.isConnected) {
        buttonText += " Connected";
    } else if (state.isConnecting) {
        buttonText += " Connecting...";
    } else if (!state.hasCredentials) {
        buttonText += " Login";
    } else {
        buttonText += " Connect";
    }

    return (
        <div className="audio-source-control">
            <ControlsButton
                text={buttonText}
                onClick={onClick}
                disabled={state.isConnected || state.isConnecting}
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
