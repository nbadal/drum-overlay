import {useEffect, useState} from "react";
import {ControlsState, ControlsStateDefault, ProviderControlState} from "../components/controls/state.ts";
import {Events} from "@wailsio/runtime";
import {sourcePlaybackManager} from "../audio/SourcePlaybackManager.ts";
import {AudioProvider, PlaybackState} from "../audio/types.ts";
import {ProviderCredentials} from "./useAudioAuth.ts";

export function useControlsState(
    playbackStates: Map<AudioProvider, PlaybackState | undefined>,
    credentials: ProviderCredentials
) {
    const [controlsState, setControlsState] = useState<ControlsState>(ControlsStateDefault);

    // Listen for source connection changes
    useEffect(() => {
        const updateControlsState = () => {
            setControlsState(prev => {
                const newStates = {...prev.providerStates};
                for (const provider of Object.values(AudioProvider)) {
                    const playback = playbackStates.get(provider);
                    const source = sourcePlaybackManager.getPlaybackSources().get(provider);
                    const creds = credentials[provider];
                    console.log("Provider:", provider, "Playback:", playback, "Source:", source, "Credentials:", creds);
                    newStates[provider] = {
                        playbackState: playback || null,
                        isConnected: source?.isConnected || false,
                        isConnecting: source?.isConnecting || false,
                        hasCredentials: !!creds,
                    } as ProviderControlState;
                }
                return ({...prev, providerStates: newStates});
            });
        };

        // Listen for source connection changes
        Events.On('source-connection-change', (data: any) => {
            console.log('Source connection changed:', data);
            updateControlsState();
        });

        // Initial update
        updateControlsState();

        return () => {
            Events.Off('source-connection-change');
        };
    }, [playbackStates, credentials]);

    // Emit controls state update to controls window
    useEffect(() => {
        Events.Emit({
            name: 'controls-state-update',
            data: controlsState
        });
    }, [controlsState]);

    return controlsState;
}