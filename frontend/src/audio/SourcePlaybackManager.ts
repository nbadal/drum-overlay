import {AudioProvider, PlaybackSource} from './types';

class SourcePlaybackManager {
    private playbackSources: Map<AudioProvider, PlaybackSource> = new Map();
    private activePlayback: PlaybackSource | null = null;

    registerSource(source: PlaybackSource) {
        this.playbackSources[source.provider] = source;
    }

    async connect(provider: AudioProvider): Promise<void> {
        const playback = this.playbackSources.get(provider);
        if (!playback) {
            throw new Error(`Audio playback for ${provider} not found`);
        }
        await playback.connect();
        this.playbackSources[provider] = {
            ...playback,
            isConnected: true,
        }
        this.activePlayback = playback;
    }

    getPlaybackSources(): Map<AudioProvider, PlaybackSource> {
        return this.playbackSources;
    }

    getActiveProvider(): AudioProvider | undefined {
        return this.activePlayback?.provider;
    }
}

export const sourcePlaybackManager = new SourcePlaybackManager();
