// logic for slider

var number_to_note_dict = {
  48 : "C3",
  49 : "C#3",
  50 : "D3",
  51 : "D#3",
  52 : "E3",
  53 : "F3",
  54 : "F#3",
  55 : "G3",
  56 : "G#3",
  57 : "A3",
  58 : "A#3",
  59 : "B3",
  60 : "C4",
  61 : "C#4",
  62 : "D4",
  63 : "D#4",
  64 : "E4",
  65 : "F4",
  66 : "F#4",
  67 : "G4",
  68 : "G#4",
  69 : "A4",
  70 : "A#4",
  71 : "B4"
}

var number_to_note_dict_inv = {}
for(var key in number_to_note_dict) {
  var value = number_to_note_dict[key];
  number_to_note_dict_inv[value] = key;
}

let rangeMin = 4;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangePrice = document.querySelectorAll(".range-price input");

rangeInput[0].value = 48;
rangeInput[1].value = 71;

rangeInput[0].min = 48;
rangeInput[0].max = 71;
rangeInput[1].min = 48;
rangeInput[1].max = 71;

rangeInput.forEach((input) => {
  input.addEventListener("input", (e) => {
    let minRange = parseInt(rangeInput[0].value); // 0
    let maxRange = parseInt(rangeInput[1].value); // 1000
    if (maxRange - minRange < rangeMin) {
      if (e.target.className === "min") {
        rangeInput[0].value = maxRange - rangeMin;
      } else {
        rangeInput[1].value = minRange + rangeMin;
      }
    } else {
      rangePrice[0].value = number_to_note_dict[minRange];
      rangePrice[1].value = number_to_note_dict[maxRange];
      melodyGeneration.setNewNotesRange(minRange, maxRange);
      
      const out = document.querySelector(".note");
      
      const pickedNotes = {
        min: number_to_note_dict[minRange],
        max: number_to_note_dict[maxRange],
      };
      // out.innerHTML = "";
      // out.insertAdjacentText(
      //   "beforebegin",
      //   `От ноты : ${pickedNotes.min} до ноты: ${pickedNotes.max}  `
      // );
      // тут ломает синюю полоску
      range.style.left = ((minRange - rangeInput[0].min) / (rangeInput[0].max - rangeInput[0].min)) * 100 + "%";
      range.style.right = 100 - ((maxRange - rangeInput[1].min) / (rangeInput[1].max - rangeInput[1].min) ) * 100 + "%";
    }
  });
});

rangePrice.forEach((input) => {
  input.addEventListener("input", (e) => {
    console.log("pull");
    let minPrice = number_to_note_dict_inv[rangePrice[0].value];
    let maxPrice = number_to_note_dict_inv[rangePrice[1].value];
    // console.log(maxPrice);
    if (maxPrice - minPrice >= rangeMin && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "min") {
        rangeInput[0].value = minPrice;
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

// end of logic for slider

function changeBackground(color) {
  document.getElementById("userGuesses").style.color = color;
  // document.body.style.background = color;
}

class MelodyGeneration {
  constructor() {
    this.melody_notes = [];
    this.durations = [];
    this.user_notes = [];
    this.notes_in_melody = 4;
    this.note_range_first = 48;
    this.note_range_last = 72;
    this.number_of_wins = 0;
  }

  setNewNotesRange(first, last) {
    this.note_range_first = first;
    this.note_range_last = last;
  }

  getRandomNote() {
    return Math.floor(Math.random() * (this.note_range_last - this.note_range_first)) + this.note_range_first;
  }

  generateMelody() {
    changeBackground('navy');
    this.number_of_wins = -1;
    this.consfirmUserWins();
    document.getElementById("userAnswer").innerText = "";
    
    this.melody_notes = [];
    this.durations = [];
    while (this.melody_notes.length < this.notes_in_melody) {
      this.melody_notes.push(this.getRandomNote());
      this.durations.push(1);
    }
  }

  async playMelody() {
    for (let i = 0; i < this.melody_notes.length; i++) {
      noteOn(this.melody_notes[i], 127, i);
      setTimeout(() => {
        noteOff(this.melody_notes[i], i);
      }, 1000 * this.durations[i]);
      await new Promise((r) => setTimeout(r, 1000 * this.durations[i]));
    }
  }

  ifUserGuessedMelody() {
    return (
      JSON.stringify(this.melody_notes) ===
      JSON.stringify(this.user_notes.slice(-this.melody_notes.length))
    );
  }

  consfirmUserWins() {
    this.number_of_wins += 1;
    document.getElementById("userGuesses").innerText = `Number of guesses: ${this.number_of_wins}`
  }

  returnAnswer() {
    return this.melody_notes;
  }

  extendUserNotes(note) {
    this.user_notes.push(note);
    while (this.user_notes.length > this.notes_in_melody) {
      this.user_notes.shift();
    }
  }
}

let melodyGeneration = new MelodyGeneration();
melodyGeneration.generateMelody();

const nextMelodyButton = document.getElementById("Next");
const playMelodyButton = document.getElementById("Play");
const showAnswerButton = document.getElementById("Answer");

nextMelodyButton.addEventListener("click", () => {
  melodyGeneration.generateMelody();
  console.log("Melody was generated");
});

playMelodyButton.addEventListener("click", () => {
  melodyGeneration.playMelody();
  console.log("Played melody");
});

showAnswerButton.addEventListener("click", () => {
  // console.log(melodyGeneration.returnAnswer());
  document.getElementById("userAnswer").innerText = "Answer: " + melodyGeneration.returnAnswer().map(x => number_to_note_dict[x]).join(", ");
});

window.AudioContext = window.AudioContext || window.webkitAudioContext;

let ctx;

const startButton = document.getElementById("ctx");
const oscillators = {};

startButton.addEventListener("click", () => {
  ctx = new AudioContext();
  console.log(ctx);
});

function midiToFreq(number) {
  const a = 440;
  return (a / 32) * 2 ** ((number - 9) / 12);
}

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(success, failure);
}

function failure() {
  console.log("Could not connect MIDI - failure call");
}

function success(midiAccess) {
  console.log("Success");
  console.log(midiAccess);
  midiAccess.addEventListener("statechange", updateDevices);

  const inputs = midiAccess.inputs;
  console.log(inputs);
  inputs.forEach((input) => {
    console.log("input");
    console.log(input);
    input.addEventListener("midimessage", handleInput);
  });
}

function handleInput(input) {
  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];
  console.log(command, note, velocity);

  switch (command) {
    case 144:
      document.getElementById('userNote').innerText  = number_to_note_dict[note];
      noteOn(note, velocity);
      break;
    case 128:
      noteOff(note);
      break;
  }
}

function noteOn(note, velocity, order = -1) {
  if (order == -1) {
    melodyGeneration.extendUserNotes(note);
    if (melodyGeneration.ifUserGuessedMelody()) {
      changeBackground('green');
      melodyGeneration.consfirmUserWins();
      // console.log("You win!");
    }
  }
  const osc = ctx.createOscillator();

  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.33;

  const velocityGainAmount = (1 / 127) * velocity;
  const velocityGain = ctx.createGain();
  velocityGain.gain.value = velocityGainAmount;

  osc.type = "sine";
  osc.frequency.value = midiToFreq(note);

  osc.connect(oscGain);
  oscGain.connect(velocityGain);
  velocityGain.connect(ctx.destination);

  osc.gain = oscGain;
  oscillators[note.toString() + order.toString()] = osc;
  osc.start();
  console.log(osc);
  console.log(oscillators);
}

function noteOff(note, order = -1) {
  const osc = oscillators[note.toString() + order.toString()];
  console.log(osc);
  const oscGain = osc.gain;

  oscGain.gain.setValueAtTime(oscGain.gain.value, ctx.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

  setTimeout(() => {
    osc.stop();
    osc.disconnect();
  }, 20);

  delete oscillators[note.toString() + order.toString()];
}

function updateDevices(event) {
  console.log(
    `Name: ${event.port.name}, Brand: ${event.port.manufactor}, State: ${event.port.state}, Type: ${event.port.type}`
  );
  // navigator.requestMIDIAccess().then(success, failure);
}
