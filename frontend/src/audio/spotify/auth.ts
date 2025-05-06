import { AuthStrategy, AuthCredentials, AuthEvents } from '../types.ts';
import { SpotifyApi, AuthenticationResponse } from "@spotify/web-api-ts-sdk";
import { Events } from "@wailsio/runtime";
import {SpotifyService} from "../../../bindings/drumbot";
import SpotifyWailsRedirectionStrategy from "./spotify-redirect.ts";

export class SpotifyAuthStrategy implements AuthStrategy {
    private api: SpotifyApi | null = null;
    private authResponse: AuthenticationResponse | null = null;
    private events: AuthEvents;

    constructor(events: AuthEvents) {
        this.events = events;
    }

    get name(): string {
        return 'Spotify';
    }

    isAuthenticated(): boolean {
        return this.authResponse !== null;
    }

    async authenticate(): Promise<AuthCredentials> {
        console.log("Starting Spotify Auth");
        if (this.authResponse) {
            return this.convertAuthResponse(this.authResponse);
        }

        const serverPort = await SpotifyService.StartCallbackServer();

        this.setupCallbackListener();

        this.api = SpotifyApi.withUserAuthorization(
            "cdc7f38bf9b84bc9aab2e78461d91638",
            `http://127.0.0.1:${serverPort}/spotify-callback`,
            ["user-read-private", "user-read-email", "user-read-playback-state", "user-modify-playback-state", "streaming"],
            {
                redirectionStrategy: new SpotifyWailsRedirectionStrategy(),
            }
        );

        this.authResponse = await this.api.authenticate();
        const credentials = this.convertAuthResponse(this.authResponse);
        this.events.onAuthStateChange?.(credentials);
        return credentials;
    }

    async disconnect(): Promise<void> {
        this.api = null;
        this.authResponse = null;
        this.events.onAuthStateChange?.(null);
    }

    private setupCallbackListener() {
        Events.On('spotify-callback', async (data: any) => {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('code', data.data[0].code);
                window.history.pushState({}, '', url.toString());

                this.authResponse = await this.api!.authenticate();
                const credentials = this.convertAuthResponse(this.authResponse);
                this.events.onAuthStateChange?.(credentials);

                url.searchParams.delete('code');
                window.history.pushState({}, '', url.toString());
            } catch (error) {
                this.events.onError?.(error as Error);
            }
        });
    }

    private convertAuthResponse(auth: AuthenticationResponse): AuthCredentials {
        return {
            accessToken: auth.accessToken,
        };
    }
}