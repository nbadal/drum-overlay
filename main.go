package main

import (
	"embed"
	_ "embed"
	"fmt"
	"github.com/wailsapp/wails/v3/pkg/application"
	"log"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	// Start listening to all MIDI notes
	noteEvents := make(chan NoteEvent, 100)
	_, err := CollectMidiEvents(noteEvents)
	if err != nil {
		fmt.Printf("MIDI ERROR: %s\n", err)
		// Continue running the app even if MIDI fails
	}
	//defer stopMidi()

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
		Height:        720,
		DisableResize: true,
		Mac: application.MacWindow{
			Backdrop: application.MacBackdropNormal,
			TitleBar: application.MacTitleBarDefault,
		},
		BackgroundColour: application.NewRGB(0, 0, 0),
		URL:              "/",
	})

	go func() {
		for {
			select {
			case noteEvent := <-noteEvents:
				fmt.Printf("Note: %d, Velocity: %d\n", noteEvent.Note, noteEvent.Velocity)
				app.EmitEvent("note", noteEvent)
			}
		}
	}()

	err = app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
