import {PlaybackSource} from './types';

export class SourcePlaybackManager {
    private sources: Map<string, PlaybackSource> = new Map();
    private activeSource: PlaybackSource | null = null;

    registerSource(source: PlaybackSource) {
        this.sources.set(source.name, source);
    }

    async connectSource(sourceName: string): Promise<void> {
        const source = this.sources.get(sourceName);
        if (!source) {
            throw new Error(`Audio source ${sourceName} not found`);
        }
        await source.connect();
        this.activeSource = source;
    }

    getActiveSource(): PlaybackSource | null {
        return this.activeSource;
    }

    getSources(): PlaybackSource[] {
        return Array.from(this.sources.values());
    }
}