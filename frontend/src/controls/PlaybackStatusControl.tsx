import {LinearProgress} from "@mui/material";
import {useEffect, useState} from "react";
import {PlaybackState} from "../audio/types.ts";

export function PlaybackStatusControl(props: { playbackState: PlaybackState | null }) {
    if (!props.playbackState) {
        return <div>Playback Status: Not Playing</div>;
    }

    // Pick largest thumbnail
    const albumArtUrl = props.playbackState.currentTrack?.albumArtUrl;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            margin: "4px",
            padding: "4px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}>
            <img
                src={albumArtUrl}
                alt={props.playbackState.currentTrack?.albumName}
                style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    marginRight: 8,
                }}
            />
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "white",
            }}>
                <div style={{
                    fontWeight: "bold",
                }}>
                    {props.playbackState.currentTrack?.name}
                </div>
                <div>
                    {props.playbackState.currentTrack?.artist}
                </div>
                <SongProgress playbackState={props.playbackState}/>
            </div>
        </div>
    );
}

function SongProgress({playbackState}: { playbackState: PlaybackState }) {
    // TODO: Figure out why we can't trust the server timestamp, we shouldn't be using our own clock.
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

    useEffect(() => {
        // If song isn't playing, don't update the timestamp
        if (!playbackState.isPlaying) {
            return;
        }

        setCurrentTimestamp(Date.now());
        const intervalId = setInterval(() => {
            setCurrentTimestamp(Date.now());
        }, 1000);

        return () => clearInterval(intervalId);
    }, [playbackState]);

    const elapsed = currentTimestamp - playbackState.startedTimestamp + playbackState.position;
    const progress = (elapsed / playbackState.duration) * 100;

    return (
        <div>
            <LinearProgress
                variant="determinate"
                value={progress}
                style={{
                    width: "100%",
                }}
            />
        </div>
    );
}