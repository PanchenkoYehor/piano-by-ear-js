// logic for slider

const notes = ["c", "d", "e", "f", "a", "b", "g", "l", "k", "o"];

// const inputMinSlider = document.querySelector(".min");
// const inputMaxSlider = document.querySelector(".max");
// const inputSlider = document.querySelector(".range");

// addEventListener("DOMContentLoaded", (event) => {
//   const quantityOfNotes = notes.length;
//   inputMinSlider.setAttribute("max", quantityOfNotes - 1);
//   inputMaxSlider.setAttribute("max", quantityOfNotes);
// });

let rangeMin = 100;
const range = document.querySelector(".range-selected");
const rangeInput = document.querySelectorAll(".range-input input");
const rangePrice = document.querySelectorAll(".range-price input");

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
      rangePrice[0].value = minRange;
      rangePrice[1].value = maxRange;
      console.log(maxRange);
      const out = document.querySelector(".note");
      // ОТСЮДА БАРТЬ ЦИФРЫ!!!!!!!!!!!!!!!!!
      const pickedNotes = {
        min: minRange / 100,
        max: maxRange / 100,
      };
      out.innerHTML = "";
      out.insertAdjacentText(
        "afterbegin",
        `От ноты : ${pickedNotes.min} до ноты: ${pickedNotes.max}  `
      );
      // тут ломает синюю полоску
      range.style.left = (minRange / rangeInput[0].max) * 100 + "%";
      range.style.right = 100 - (maxRange / rangeInput[1].max) * 100 + "%";
    }
  });
});

rangePrice.forEach((input) => {
  input.addEventListener("input", (e) => {
    console.log("pull");
    let minPrice = rangePrice[0].value;
    let maxPrice = rangePrice[1].value;
    // console.log(maxPrice);
    if (maxPrice - minPrice >= rangeMin && maxPrice <= rangeInput[1].max) {
      if (e.target.className === "min") {
        rangeInput[0].value = minPrice;
        // тут ломает синюю полоску
        range.style.left = (minPrice / rangeInput[0].max) * 100 + "%";
      } else {
        rangeInput[1].value = maxPrice;
        range.style.right = 100 - (maxPrice / rangeInput[1].max) * 100 + "%";
      }
    }
  });
});

// end of logic for slider

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
    this.melody_notes = [];
    this.durations = [];
    while (this.melody_notes.length < this.notes_in_melody) {
      this.melody_notes.push(this.notes[this.getRandomInt(this.notes.length)]);
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
  console.log(melodyGeneration.returnAnswer());
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
      console.log("You win!");
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
