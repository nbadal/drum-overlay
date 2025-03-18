package main

import (
	"fmt"
	"github.com/wailsapp/wails/v3/pkg/application"
	"gitlab.com/gomidi/midi/v2"
	_ "gitlab.com/gomidi/midi/v2/drivers/rtmididrv"
	"time"
)

type NoteEvent struct {
	Note     uint8
	Velocity uint8
}

func StartMidiHandler(app *application.App) {
	// Start listening to all MIDI notes
	noteEvents := make(chan NoteEvent, 100)
	stopMidiChan := make(chan func())

	go func() {
		stopMidi, err := collectMidiEvents(noteEvents)
		if err != nil {
			fmt.Printf("MIDI ERROR: %s\n", err)
			return
		}
		stopMidiChan <- stopMidi
	}()

	go func() {
		for {
			select {
			case noteEvent := <-noteEvents:
				app.EmitEvent("note", noteEvent)
			}
		}
	}()
}

func collectMidiEvents(noteEvents chan NoteEvent) (func(), error) {
	var stop func()

	for {
		in, err := midi.FindInPort("TD-50")
		if err != nil {
			fmt.Println("TD-50 not found, retrying in 5 seconds")
			time.Sleep(5 * time.Second)

			continue
		}

		stop, err = midi.ListenTo(in, func(msg midi.Message, timestampms int32) {
			var bt []byte
			var ch, key, vel uint8
			switch {
			case msg.GetSysEx(&bt):
				//fmt.Printf("got sysex: % X\n", bt)
			case msg.GetNoteStart(&ch, &key, &vel):
				noteEvents <- NoteEvent{Note: key, Velocity: vel}
			case msg.GetNoteEnd(&ch, &key):
				//fmt.Printf("ending note %s on channel %v\n", midi.Note(key), ch)
			default:
				// ignore
			}
		}, midi.UseSysEx())

		if err != nil {
			fmt.Printf("Failed to listen to MIDI: %s\n", err)
			return nil, err
		}

		break
	}

	return func() {
		defer midi.CloseDriver()
		stop()
	}, nil
}
