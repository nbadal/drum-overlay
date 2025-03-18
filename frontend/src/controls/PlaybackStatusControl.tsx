import {LinearProgress} from "@mui/material";
import {useEffect, useState} from "react";

export function PlaybackStatusControl(props: { playbackState: Spotify.PlaybackState | null }) {
    if (!props.playbackState) {
        return <div>Playback Status: Not Playing</div>;
    }

    // Pick largest thumbnail
    const albumArtUrl = props.playbackState.track_window.current_track.album.images.sort(
        (a, b) => (b.width ?? 0) - (a.width ?? 0)
    )[0].url;

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
                alt={props.playbackState.track_window.current_track.album.name}
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
                    {props.playbackState.track_window.current_track.name}
                </div>
                <div>
                    {props.playbackState.track_window.current_track.artists[0].name}
                </div>
                <SongProgress playbackState={props.playbackState}/>
            </div>
        </div>
    );
}

function SongProgress({playbackState}: { playbackState: Spotify.PlaybackState }) {
    // TODO: Figure out why we can't trust the server timestamp, we shouldn't be using our own clock.
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTimestamp(Date.now());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const elapsed = currentTimestamp - playbackState.timestamp + playbackState.position;
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