import {createContext} from 'react';
import {ControlsState} from "../controls/state.ts";

interface ControlsUpdate {
    state: ControlsState;
    requestConnect: (sourceName: string) => void;
    requestDisconnect: (sourceName: string) => void;
}

export const ControlsUpdateContext = createContext<ControlsUpdate>({
    state: {audioSources: {}},
    requestConnect: () => {
    },
    requestDisconnect: () => {
    },
});
