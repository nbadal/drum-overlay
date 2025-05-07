import React, {useEffect, useState} from "react";
import {Events} from "@wailsio/runtime";
import {ControlsState, ControlsStateDefault, ProviderControlState} from "./state.ts";
import Button from "@mui/material/Button";
import {AudioSourceControl} from "./AudioSourceControl.tsx";

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

    const handleSourceAction = async (sourceName: string) => {
        const providerState: ProviderControlState = controlsState.providerStates[sourceName];

        if (!providerState.hasCredentials) {
            await Events.Emit({
                name: 'control-source-auth',
                data: {sourceName}
            });
        } else if (!providerState.isConnected) {
            await Events.Emit({
                name: 'control-source-connect',
                data: {sourceName}
            });
        } else {
            // Already connected, do nothing
        }
    };

    return (
        <div className="Controls">
            {Object.entries(controlsState.providerStates)
                .map(([sourceName, sourceState]) => (
                    <AudioSourceControl
                        key={sourceName}
                        name={sourceName}
                        state={sourceState}
                        onClick={() => handleSourceAction(sourceName)}
                    />
                ))}
            <ControlsButton
                text="Reset Notes"
                onClick={() => Events.Emit({name: 'control-reset-notes', data: {}})}
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
