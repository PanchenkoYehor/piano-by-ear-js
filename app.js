class MelodyGeneration {
    constructor() {
        this.melody_notes = [];
        this.durations = [];
        this.user_notes = [];
        this.notes_in_melody = 4;
        this.notes = [60, 61, 62, 63, 64];
    }

    getRandomInt(max) {
        return Math.floor(Math.random() * max);
      }

    generateMelody() {
        this.melody_notes = []
        this.durations = []
        while (this.melody_notes.length < this.notes_in_melody) {
            this.melody_notes.push(this.notes[this.getRandomInt(this.notes.length)]);
            this.durations.push(1);
        }
    }

    playMelody() {
        for (let i = 0; i < this.melody_notes.length; i++) {
            noteOn(this.melody_notes[i], 127);
            setTimeout(() => {
                noteOff(this.melody_notes[i]);
            }, 500 * this.durations.length);
          }
    }

    ifUserGuessedMelody() {
        return JSON.stringify(this.melody_notes) === JSON.stringify(this.user_notes.slice(-this.melody_notes.length));
    }

    returnAnswer() {
        return this.melody_notes;
    }
}

let melodyGeneration = new MelodyGeneration();
melodyGeneration.generateMelody();

const nextMelodyButton = document.getElementById("Next");
const playMelodyButton = document.getElementById("Play");
const showAnswerButton = document.getElementById("Answer");

nextMelodyButton.addEventListener('click', () => {
    melodyGeneration.generateMelody();
    console.log("Melody was generated");
})

playMelodyButton.addEventListener('click', () => {
    melodyGeneration.playMelody();
    console.log("Played melody");
})

showAnswerButton.addEventListener('click', () => {
    console.log(melodyGeneration.returnAnswer())
})

window.AudioContext = window.AudioContext || window.webkitAudioContext;

let ctx;

const startButton = document.getElementById('ctx');
const oscillators = {};

startButton.addEventListener('click', () => {
    ctx = new AudioContext();
    console.log(ctx);
})

function midiToFreq(number) {
    const a = 440;
    return (a / 32) * (2 ** ((number - 9 ) / 12));
}

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(success, failure);
}

function failure() {
    console.log('Could not connect MIDI - failure call');
}

function success(midiAccess) {
    console.log("Success");
    console.log(midiAccess);
    midiAccess.addEventListener('statechange', updateDevices);

    const inputs = midiAccess.inputs;
    console.log(inputs);
    inputs.forEach((input) => {
        console.log("input");
        console.log(input);
        input.addEventListener('midimessage', handleInput);
    });
}

function handleInput(input) {
    const command = input.data[0];
    const note = input.data[1];
    const velocity = input.data[2];
    // console.log(command, note, velocity);

    switch(command) {
        case 144:
            noteOn(note, velocity);
            break;
        case 128:
            noteOff(note);
            break;
    }
}

function noteOn(note, velocity) {
    const osc = ctx.createOscillator();

    // console.log(oscillators);
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.33;

    const velocityGainAmount = (1 / 127) * velocity;
    const velocityGain = ctx.createGain();
    velocityGain.gain.value = velocityGainAmount;

    osc.type = 'sine';
    osc.frequency.value = midiToFreq(note);

    osc.connect(oscGain);
    oscGain.connect(velocityGain);
    velocityGain.connect(ctx.destination);

    osc.gain = oscGain;
    oscillators[note.toString()] = osc;
    osc.start();
    console.log(osc);
}

function noteOff(note) {
    const osc = oscillators[note.toString()]; 
    const oscGain = osc.gain;

    oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    setTimeout(() => {
        osc.stop();
        osc.disconnect();
    }, 20);

    delete oscillators[note.toString()];
}

function updateDevices(event) {
    console.log(`Name: ${event.port.name}, Brand: ${event.port.manufactor}, State: ${event.port.state}, Type: ${event.port.type}`);
    // navigator.requestMIDIAccess().then(success, failure);
}