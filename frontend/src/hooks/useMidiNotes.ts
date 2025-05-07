import {PlaybackState, PlaybackTrack} from "../audio/types.ts";
import {useEffect, useState} from "react";
import {Note} from "../notes.ts";
import {Events} from "@wailsio/runtime";

export function useMidiNotes(activePlaybackState: PlaybackState | undefined) {
    const [trackingSong, setTrackingSong] = useState<PlaybackTrack | null>(null);
    useEffect(() => {
        const song = activePlaybackState?.currentTrack;
        if (song && song !== trackingSong) {
            setTrackingSong(song);
            console.log("Now tracking song:", song.name);
        }
    }, [activePlaybackState]);

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

    useEffect(() => {
        // Each time the tracking song changes, print totals, reset.
        if (!trackingSong) {
            return;
        }
        console.log("Song:", trackingSong);
        console.log("Notes:", allNotes.length);
        setAllNotes([]);
    }, [trackingSong]);

    return allNotes;
}