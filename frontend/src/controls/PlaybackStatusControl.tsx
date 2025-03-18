export function PlaybackStatusControl(props: { playbackState: Spotify.PlaybackState | null }) {
    if (!props.playbackState) {
        return <div>Playback Status: Not Playing</div>;
    }

    return (
        <div>
            <div>Playback Status: {props.playbackState.paused ? "Paused" : "Playing"}</div>
            <div>Track: {props.playbackState.track_window.current_track.name}</div>
            <div>Artist: {props.playbackState.track_window.current_track.artists[0].name}</div>
        </div>
    );
}