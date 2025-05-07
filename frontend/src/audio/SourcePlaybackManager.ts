import {AudioProvider, PlaybackSource} from './types';
import {Events} from "@wailsio/runtime";

class SourcePlaybackManager {
    private playbackSources: Map<AudioProvider, PlaybackSource> = new Map();
    private activePlayback: PlaybackSource | null = null;

    registerSource(source: PlaybackSource) {
        console.log(`Registering source: ${source.provider}`, source);
        this.playbackSources.set(source.provider, source);
    }

    async connect(provider: AudioProvider): Promise<void> {
        const playback = this.playbackSources.get(provider);
        if (!playback) {
            throw new Error(`Audio playback for ${provider} not found`);
        }
        console.log(`Connecting to source: ${provider}`, playback);
        await playback.connect();
        this.activePlayback = playback;

        // Emit an event to notify that a source has been connected
        Events.Emit({
            name: 'source-connection-change',
            data: {provider, connected: true}
        });
    }

    getPlaybackSources(): Map<AudioProvider, PlaybackSource> {
        return this.playbackSources;
    }

    getActiveProvider(): AudioProvider | undefined {
        return this.activePlayback?.provider;
    }

    async disconnect(provider: AudioProvider): Promise<void> {
        const playback = this.playbackSources.get(provider);
        if (!playback) {
            throw new Error(`Audio playback for ${provider} not found`);
        }
        console.log(`Disconnecting from source: ${provider}`, playback);
        await playback.disconnect();
        if (this.activePlayback?.provider === provider) {
            this.activePlayback = null;
        }

        // Emit an event to notify that a source has been disconnected
        Events.Emit({
            name: 'source-connection-change',
            data: {provider, connected: false}
        });
    }
}

export const sourcePlaybackManager = new SourcePlaybackManager();
