package main

import (
	"fmt"
	"gitlab.com/gomidi/midi/v2"
	_ "gitlab.com/gomidi/midi/v2/drivers/rtmididrv"
	"os"
	"os/signal"
)

var td50MidiNames = map[int]string{
	26: "Hi-Hat Edge",
	33: "AUX EDGE",
	34: "AUX",
	36: "Kick",
	37: "Snare X-Stick",
	38: "Snare",
	39: "Tom 3 Rim",
	40: "Snare Rim",
	41: "Tom 3",
	43: "Tom 2",
	44: "Hi-Hat Pedal",
	46: "Hi-Hat",
	48: "Tom 1",
	49: "Crash 1",
	50: "Tom 1 Rim",
	51: "Ride",
	52: "Crash 2 Edge",
	53: "Ride Bell",
	55: "Crash 1 Edge",
	57: "Crash 2",
	58: "Tom 2 Rim",
	59: "Ride Edge",
}

func maint() {
	noteEvents := make(chan NoteEvent, 100)
	stopMidi, err := CollectMidiEvents(noteEvents)

	if err != nil {
		fmt.Printf("ERROR: %s\n", err)
		return
	}

	if stopMidi == nil {
		fmt.Println("stopMidi is nil")
		return
	}

	histPerNote := make(map[uint8]int)
	totalHits := 0

	go func() {
		for {
			select {
			case noteEvent := <-noteEvents:
				histPerNote[noteEvent.Note]++
				totalHits++
			}
		}
	}()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	go func() {
		for range c {
			for k, v := range histPerNote {
				fmt.Printf("#%s (%d) - %s: %d\n", midi.Note(k), k, td50MidiNames[int(k)], v)
			}
			fmt.Printf("Total hits: %d\n", totalHits)
			if stopMidi != nil {
				stopMidi()
			} else {
				fmt.Println("stopMidi is nil during signal handling")
			}

			os.Exit(0)
		}
	}()

	select {}
}

type NoteEvent struct {
	Note     uint8
	Velocity uint8
}

func CollectMidiEvents(noteEvents chan NoteEvent) (func(), error) {
	in, err := midi.FindInPort("TD-50")
	if err != nil {
		return nil, err
	}

	stop, err := midi.ListenTo(in, func(msg midi.Message, timestampms int32) {
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
		return nil, err
	}

	return func() {
		defer midi.CloseDriver()
		stop()
	}, nil
}
