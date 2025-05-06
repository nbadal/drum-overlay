import React, {useEffect, useState} from "react";
import {Events} from "@wailsio/runtime";
import {ControlsState, ControlsStateDefault} from "./state.ts";
import Button from "@mui/material/Button";
import { AudioSourceControl } from "./AudioSourceControl.tsx";

function ControlsRoot() {
    const [controlsState, setControlsState] = useState<ControlsState>(ControlsStateDefault);

    useEffect(() => {
        Events.On('controls-state-update', (e: any) => {
            setControlsState(e.data);
        });

        return () => {
            Events.Off('controls-state-update');
        };
    }, []);

    const requestConnect = async (sourceName: string) => {
        await Events.Emit({
            name: 'control-source-connect',
            data: { sourceName }
        });
    };

    return (
        <div className="Controls">
            {Object.entries(controlsState.audioSources).map(([sourceName, sourceState]) => (
                <AudioSourceControl
                    key={sourceName}
                    name={sourceName}
                    state={sourceState}
                    onConnectRequest={() => requestConnect(sourceName)}
                />
            ))}
            <ControlsButton
                text="Reset Notes"
                onClick={() => Events.Emit({ name: 'control-reset-notes', data: {} })}
            />
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
