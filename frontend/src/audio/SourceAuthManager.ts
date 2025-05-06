import { AuthStrategy, AuthCredentials } from './types';

export class SourceAuthManager {
    private strategies = new Map<string, AuthStrategy>();
    private credentials = new Map<string, AuthCredentials>();

    registerStrategy(strategy: AuthStrategy) {
        this.strategies.set(strategy.name, strategy);
    }

    async authenticate(strategyName: string): Promise<AuthCredentials> {
        const strategy = this.getStrategy(strategyName);
        const credentials = await strategy.authenticate();
        this.credentials.set(strategyName, credentials);
        return credentials;
    }

    async disconnect(strategyName: string): Promise<void> {
        const strategy = this.getStrategy(strategyName);
        await strategy.disconnect();
        this.credentials.delete(strategyName);
    }

    getCredentials(strategyName: string): AuthCredentials | undefined {
        return this.credentials.get(strategyName);
    }

    isAuthenticated(strategyName: string): boolean {
        const strategy = this.strategies.get(strategyName);
        return strategy ? strategy.isAuthenticated() : false;
    }

    private getStrategy(name: string): AuthStrategy {
        const strategy = this.strategies.get(name);
        if (!strategy) {
            throw new Error(`Auth strategy '${name}' not found`);
        }
        return strategy;
    }
}