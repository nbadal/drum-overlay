export interface Note {
    note: number,
    velocity: number,
}

export const td50NoteMap: { [key: number]: string } = {
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
