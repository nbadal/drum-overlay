import { AuthStrategy, AuthCredentials, AudioProvider } from './types';

class SourceAuthManager {
    private strategies = new Map<AudioProvider, AuthStrategy>();
    private credentials = new Map<AudioProvider, AuthCredentials>();

    registerStrategy(strategy: AuthStrategy) {
        this.strategies.set(strategy.provider, strategy);
    }

    async authenticate(provider: AudioProvider): Promise<AuthCredentials> {
        const strategy = this.getStrategy(provider);
        const credentials = await strategy.authenticate();
        this.credentials.set(provider, credentials);
        return credentials;
    }

    async disconnect(provider: AudioProvider): Promise<void> {
        const strategy = this.getStrategy(provider);
        await strategy.disconnect();
        this.credentials.delete(provider);
    }

    getCredentials(provider: AudioProvider): AuthCredentials | undefined {
        return this.credentials.get(provider);
    }

    isAuthenticated(provider: AudioProvider): boolean {
        return this.credentials.has(provider);
    }

    private getStrategy(provider: AudioProvider): AuthStrategy {
        const strategy = this.strategies.get(provider);
        if (!strategy) {
            throw new Error(`Auth strategy for '${provider}' not found`);
        }
        return strategy;
    }
}

export const sourceAuthManager = new SourceAuthManager();