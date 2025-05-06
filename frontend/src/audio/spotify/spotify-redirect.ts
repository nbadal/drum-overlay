import {IRedirectionStrategy} from "@spotify/web-api-ts-sdk";
import {SpotifyService} from "../../../bindings/drumbot";

export default class SpotifyWailsRedirectionStrategy implements IRedirectionStrategy {
    public async redirect(targetUrl: string | URL): Promise<void> {
        console.log("Redirecting to: " + targetUrl.toString());
        SpotifyService.RedirectTo(targetUrl.toString()).then(() => {
            console.log("Redirected");
        });
    }

    public async onReturnFromRedirect(): Promise<void> {
    }
}
