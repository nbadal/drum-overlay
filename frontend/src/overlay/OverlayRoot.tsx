import {useEffect, useState} from "react";
import {Events} from "@wailsio/runtime";
import {motion} from "motion/react";
import {Note, td50NoteMap} from "../notes.ts";
import {useSpotifyState} from "./SpotifyAuthState.tsx";
import {ControlsProvider} from "./ControlsContext.tsx";

function OverlayRoot() {
    return (
        <ControlsProvider>
            <OverlayContent/>
        </ControlsProvider>);
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

    const [, spotifyPlayer] = useSpotifyState();

    const [trackingSong, setTrackingSong] = useState<string | null>(null);
    useEffect(() => {
        const song = spotifyPlayer?.playbackState?.track_window.current_track.id;
        if (song && song !== trackingSong) {
            setTrackingSong(song);
            console.log("Now tracking song:", song);
        }
    }, [spotifyPlayer?.playbackState]);

    useEffect(() => {
        // Each time the tracking song changes, print totals, reset.
        if (!trackingSong) {
            return;
        }
        console.log("Song:", trackingSong);
        console.log("Notes:", allNotes.length);
        setAllNotes([]);
    }, [trackingSong]);

    return (
        <>
            <div className="Overlay">
                {spotifyPlayer && (
                    <div>Player Connected!</div>
                )}
                {spotifyPlayer?.playbackState && (
                    <div>
                        <div>Playing: {spotifyPlayer?.playbackState.track_window.current_track.name}</div>
                        <div>Artist: {spotifyPlayer?.playbackState.track_window.current_track.artists[0].name}</div>
                        <div>Progress: {spotifyPlayer?.playbackState.position} / {spotifyPlayer?.playbackState.duration}</div>
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