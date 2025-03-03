package main

import (
	"errors"
	"github.com/wailsapp/wails/v3/pkg/application"
	"log"
	"net/http"
	"strconv"
)

type SpotifyService struct {
	app    *application.App
	window *application.WebviewWindow
	srv    *http.Server
}

func (g *SpotifyService) RedirectTo(url string) {
	log.Println("Spotify wants a redirect to", url)
	g.window = g.app.NewWebviewWindowWithOptions(
		application.WebviewWindowOptions{
			Title:            "Spotify Login",
			URL:              url,
			BackgroundColour: application.NewRGB(0, 255, 0),
		})
}

func (g *SpotifyService) StartCallbackServer() int {
	port := 8080
	if g.srv == nil {
		go g.startServer(port)
	}
	return port
}

func (g *SpotifyService) startServer(port int) {
	http.HandleFunc("/spotify-callback", g.handleCallback)

	g.srv = &http.Server{Addr: ":" + strconv.Itoa(port)}

	// always returns error. ErrServerClosed on graceful close
	if err := g.srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("ListenAndServe: %v", err)
	}
}

func (g *SpotifyService) handleCallback(w http.ResponseWriter, r *http.Request) {
	_, err := w.Write([]byte("You can close this window now!"))
	if err != nil {
		log.Fatalf("Write: %v", err)
	}

	code := r.URL.Query().Get("code")
	log.Println("Code:", code)

	g.app.EmitEvent("spotify-callback", &CodeResponse{
		Code:         code,
		OriginalPort: 8080,
	})

	// TODO: Figure out why shutting down the server makes the response and close fail
	//err = g.srv.Shutdown(r.Context())
	//if err != nil {
	//	log.Fatalf("Shutdown: %v", err)
	//}

	g.window.Close()
}

type CodeResponse struct {
	Code         string `json:"code"`
	OriginalPort int    `json:"originalPort"`
}
