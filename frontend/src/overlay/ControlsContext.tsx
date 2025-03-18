import React, {createContext, useContext, useEffect, useReducer} from "react";
import {Events} from "@wailsio/runtime";
import {ControlsState, ControlsStateDefault} from "../controls/state.ts";


type Action = { type: "SET_SPOTIFY_AUTHENTICATED"; hasAuth: boolean } |
    { type: "SET_SPOTIFY_PLAYBACK_STATE"; playbackState: Spotify.PlaybackState | null };

const ControlsDispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

const controlsReducer = (state: ControlsState, action: Action): ControlsState => {
    switch (action.type) {
        case "SET_SPOTIFY_AUTHENTICATED":
            return {...state, spotifyAuthenticated: action.hasAuth};
        case "SET_SPOTIFY_PLAYBACK_STATE":
            return {...state, spotifyPlaybackState: action.playbackState};
        default:
            return state;
    }
};

export const ControlsProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [state, dispatch] = useReducer(controlsReducer, ControlsStateDefault);

    useEffect(() => {
        Events.Emit({name: 'controls-state', data: state}).then(
            () => console.log("Sent controls state", state)
        ).catch(
            (err) => console.error("Failed to send controls state", err)
        );
    }, [state]);

    return (
        <ControlsDispatchContext.Provider value={dispatch}>{children}</ControlsDispatchContext.Provider>
    );
};

export const useControlsDispatch = () => {
    const context = useContext(ControlsDispatchContext);
    if (!context) throw new Error("useControlsDispatch must be used within a ControlsProvider");
    return context;
};
