package main

import (
	"embed"
	_ "embed"
	"github.com/wailsapp/wails/v3/pkg/application"
	"log"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	spotifyService := &SpotifyService{}
	app := application.New(application.Options{
		Name:        "drum-overlay",
		Description: "My cool drumming overlay",
		Services: []application.Service{
			application.NewService(spotifyService),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})
	spotifyService.app = app

	app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:         "Drumbot Overlay",
		Width:         1280,
		Height:        720 + 20, // 20 to get away from the bottom corner rounding
		DisableResize: true,
		Mac: application.MacWindow{
			Backdrop: application.MacBackdropNormal,
			TitleBar: application.MacTitleBarDefault,
		},
		BackgroundColour: application.NewRGB(0, 0, 0),
		URL:              "/",
	})

	app.NewWebviewWindowWithOptions(application.WebviewWindowOptions{
		Title:  "Drumbot Controls",
		Width:  200,
		Height: 600,
		Mac: application.MacWindow{
			Backdrop: application.MacBackdropNormal,
			TitleBar: application.MacTitleBarDefault,
		},
		BackgroundColour: application.NewRGB(0, 0, 0),
		URL:              "/controls",
	})

	StartMidiHandler(app)

	err := app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
