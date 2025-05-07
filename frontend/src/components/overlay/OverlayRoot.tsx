import {motion} from "motion/react";
import {td50NoteMap} from "../../notes.ts";
import {useAudioPlayback} from "../../hooks/useAudioPlayback.ts";
import {AudioProvider} from "../../audio/types.ts";
import {useAudioAuth} from "../../hooks/useAudioAuth.ts";
import {sourcePlaybackManager} from "../../audio/SourcePlaybackManager.ts";
import {useControlsState} from "../../hooks/useControlsState.ts";
import {useMidiNotes} from "../../hooks/useMidiNotes.ts";

function OverlayRoot() {
    const credentials = useAudioAuth();
    const playbackStates = useAudioPlayback(credentials);
    useControlsState(playbackStates, credentials);

    const activePlaybackState = playbackStates.get(sourcePlaybackManager.getActiveProvider() || AudioProvider.Spotify);
    const allNotes = useMidiNotes(activePlaybackState);

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
