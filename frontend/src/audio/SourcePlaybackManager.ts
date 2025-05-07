import {AudioProvider, PlaybackSource} from './types';
import {Events} from "@wailsio/runtime";

export class SourcePlaybackManager {
    private playbackSources: Map<AudioProvider, PlaybackSource> = new Map();
    private activePlayback: PlaybackSource | null = null;

    constructor() {
        // Set up event listener for connect requests
        console.log("SourcePlaybackManager initialized");
        Events.On('control-source-connect', async (data: any) => {
            const sourceName = data.data.sourceName;
            console.log(`Starting ${sourceName} Connect`);
            try {
                await this.connect(sourceName);
            } catch (error) {
                console.error(`Failed to connect to ${sourceName}:`, error);
            }
        });
    }

    registerSource(source: PlaybackSource) {
        this.playbackSources[source.provider] = source;
    }

    async connect(providerName: string): Promise<void> {
        const playback = this.playbackSources[providerName];
        if (!playback) {
            throw new Error(`Audio playback for ${providerName} not found`);
        }
        await playback.connect();
        this.playbackSources[providerName] = {
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

    cleanup() {
        console.log("SourcePlaybackManager cleanup");
        Events.Off('control-source-connect');
    }
}
