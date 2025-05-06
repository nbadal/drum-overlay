import {useEffect, useState} from "react";
import {Events} from "@wailsio/runtime";
import {motion} from "motion/react";
import {Note, td50NoteMap} from "../notes.ts";
import {useAudioPlayback} from "../hooks/useAudioPlayback.ts";
import {PlaybackTrack} from "../audio/types.ts";
import {useAudioAuth} from "../hooks/useAudioAuth.ts";
import {ControlsState} from "../controls/state.ts";

function OverlayRoot() {
    return (
        <OverlayContent/>
    );
}

function OverlayContent() {
    const [allNotes, setAllNotes] = useState<Note[]>([]);

    useEffect(() => {
        Events.On('note', (timeValue: any) => {
            setAllNotes(prev => [...prev, {
                note: timeValue.data[0].Note,
                velocity: timeValue.data[0].Velocity
            }]);
        });
        Events.On('control-reset-notes', () => {
            setAllNotes([]);
        });
        return () => {
            Events.Off('note');
            Events.Off('control-reset-notes');
        }
    }, []);

    const {credentials} = useAudioAuth();
    const {sourceManager, activePlaybackState, playbackStates} = useAudioPlayback(credentials);

    const [trackingSong, setTrackingSong] = useState<PlaybackTrack | null>(null);
    useEffect(() => {
        const song = activePlaybackState?.currentTrack;
        if (song && song !== trackingSong) {
            setTrackingSong(song);
            console.log("Now tracking song:", song.name);
        }
    }, [activePlaybackState]);

    useEffect(() => {
        // Each time the tracking song changes, print totals, reset.
        if (!trackingSong) {
            return;
        }
        console.log("Song:", trackingSong);
        console.log("Notes:", allNotes.length);
        setAllNotes([]);
    }, [trackingSong]);

    // Push state updates to controls window
    useEffect(() => {
        const state: ControlsState = {
            audioSources: {}
        };

        // Get all sources
        const sources = sourceManager.getSources();

        // For each source, use the playback state from the hook
        for (const source of sources) {
            state.audioSources[source.name] = {
                isConnected: source.isConnected,
                playbackState: playbackStates[source.name] || null
            };
        }

        // Emit state update to controls window
        Events.Emit({
            name: 'controls-state-update',
            data: state
        });
    }, [sourceManager, playbackStates]);

    // Handle connect requests from controls
    useEffect(() => {
        Events.On('control-source-connect', async (data: any) => {
            const sourceName = data.data.sourceName;
            try {
                await sourceManager.connectSource(sourceName);
            } catch (error) {
                console.error(`Failed to connect to ${sourceName}:`, error);
            }
        });

        return () => {
            Events.Off('control-source-connect');
        };
    }, [sourceManager]);


    return (
        <>
            <div className="Overlay">
                {activePlaybackState && (
                    <div>
                        <div>Playing: {activePlaybackState.currentTrack?.name}</div>
                        <div>Artist: {activePlaybackState.currentTrack?.artist}</div>
                        <div>Progress: {activePlaybackState.position} / {activePlaybackState.duration}</div>
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

export default OverlayRoot
