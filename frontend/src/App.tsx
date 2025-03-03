import {useEffect, useState} from 'react'
import {Events, WML} from "@wailsio/runtime";
import {SpotifyApi} from "@spotify/web-api-ts-sdk";
import WailsRedirectionStrategy from "./spotify-redirect.ts";
import {SpotifyService} from "../bindings/drumbot";

async function doSpotifyAuth(serverPort: number) {
    const api = SpotifyApi.withUserAuthorization(
        "cdc7f38bf9b84bc9aab2e78461d91638",
        `http://127.0.0.1:${serverPort}/spotify-callback`,
        ["user-read-private", "user-read-email", "user-read-playback-state", "user-modify-playback-state"],
        {
            redirectionStrategy: new WailsRedirectionStrategy(),
        }
    );
    await api.authenticate();
}

function App() {
    const [time, setTime] = useState<string>('Listening for Time event...');

    const doSpotifyLogin = () => {
        (async () => {
            const serverPort = await SpotifyService.StartCallbackServer();
            console.log("Server started on port: " + serverPort);

            await doSpotifyAuth(serverPort);
        })().then(() => {
                console.log("Spotify Auth Started");
            }
        ).catch((err: any) => {
                console.log(err);
            }
        );

        // SpotifyService.Greet().then(() => {
        //     setResult("foo");
        // }).catch((err: any) => {
        //     console.log(err);
        // });
    }

    useEffect(() => {
        Events.On('time', (timeValue: any) => {
            setTime(timeValue.data);
        });
        Events.On('spotify-callback', (data: any) => {
            console.log("Spotify Callback", data);
            console.log("Spotify Code", data.data[0].code);
            console.log("Spotify Port", data.data[0].originalPort);

            // Inject the `code` into our query string
            const url = new URL(window.location.href);
            url.searchParams.set('code', data.data[0].code);
            window.history.pushState({}, '', url.toString());

            // Re-authenticate with Spotify
            doSpotifyAuth(data.data[0].originalPort).then(
                () => {
                    console.log("Re-authenticated with Spotify");
                    // Clear the code from the query string
                    url.searchParams.delete('code');
                    window.history.pushState({}, '', url.toString());
                }
            ).catch(
                (err: any) => console.log(err)
            );
        });
        // Reload WML so it picks up the wml tags
        WML.Reload();
    }, []);

    return (
        <div className="container">
            <div>
                <a wml-openURL="https://wails.io">
                    <img src="/wails.png" className="logo" alt="Wails logo"/>
                </a>
                <a wml-openURL="https://reactjs.org">
                    <img src="/react.svg" className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Wails + React</h1>
            <div className="card">
                <div className="input-box">
                    <button className="btn" onClick={doSpotifyLogin}>Greet</button>
                </div>
            </div>
            <div className="footer">
                <div><p>Click on the Wails logo to learn more</p></div>
                <div><p>{time}</p></div>
            </div>
        </div>
    )
}

export default App
