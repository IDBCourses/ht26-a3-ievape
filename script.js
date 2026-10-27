/*
 * IDB Programming: A3 — a musical instrument
 *
 * All of the code for your instrument goes in this file. It's split into sections:
 *   settings — the "fixed" parts of your program
 *   state    — the parts of your program that change over time
 *   sound    — the Tone.js instruments and effects
 *   update   — updates the state every 100ms, if necessary
 *   use      — uses the state to make sound and shapes every 100ms, if necessary
 *   controls — what happens when the player uses the pointer
 *   setup    — starts everything
 *
 * The pointer events change the state. update() and use() each run every
 * 100ms, in a loop:
 *   1. update: change the state, e.g. based on time or on the pointer's movement
 *   2. use:    make sound and move shapes, based on the state
 *
 * Shapes come from shape.js: createShape() makes one, and its methods
 * (setPosition, setSize, setColour ...) change it.
 *
 * Tone.js documentation: https://tonejs.github.io/docs/15.1.22/
 */

// Idea for an intrument:
// a) a key that generates a random melody
// b) a shape that does three things / three different shapes:
//  b1) changes adds effect upon hovering
//  b2) changes synth / octave when click
//  b3) does something when you move from left to right, maybe makes melody play slower of faster

import { createShape } from "./shape.js";

// ---------- Settings ----------
// Settings variables should contain all of the "fixed" parts of your programs
// For example: which notes you can play, how fast things move, the tempo.
//const note = "C4"; // the note played when the pointer goes down
const notes = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"];
const keys = {}; // will hold each shape, looked up by its note name
const keyboard = {
  a: "C4", w: "C#4", s: "D4", e: "D#4", d: "E4", f: "F4",
  r: "F#4", g: "G4", t: "G#4", h: "A4", y: "A#4", j: "B4",
};
const wobbleShape = createShape("wobbleShape");
wobbleShape.setPosition(0.5, 0.5);
wobbleShape.setSize(250);

for (let i = 0; i < notes.length; i++) {
  const note = notes[i];
  const isBlack = note.includes("#");

  let x = i * 0.05;
  if (i >= 5) {
    x = x + 0.05; // the gap between E and F
  }

  const key = createShape("note" + (i + 1));
  key.setSize(50);
  key.setRoundedness(0);

  if (isBlack) {
    key.setPosition(x, 0);
    key.setColour(0, 0, 0);
  } else {
    key.setPosition(x, 0.1);
    key.setColour(300, 90, 90);
  }

  keys[note] = key;
}

// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
let lastX = 0;
let lastY = 0;
let lastTime = 0;
let speeds = [];

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth); // can play several notes at once, deleted .toDestination so it doesn't interfere with vibrato effect
let vibrato = new Tone.Vibrato(2, 0.5); // speed and depth, speed from 1 to 9
synth.chain(vibrato, Tone.Destination);
// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
function keyDown(event) {
  Tone.start(); // browsers only allow sound after the player has pressed something

  if (event.repeat === false) {
    const note = keyboard[event.key];

    if (note) { // undefined if the key isn't part of the piano
      console.log("Playing " + note);
      keys[note].setColour(204, 100, 50);
      synth.triggerAttack(note);
    }
  }
}

function keyUp(event) {
  const note = keyboard[event.key];

  if (note) {
    if (note.includes("#")) {
      keys[note].setColour(0, 0, 0);    // black key
    } else {
      keys[note].setColour(300, 90, 90); // pink key
    }
    synth.triggerRelease(note);
  }
}

function addVibrato() {
  vibrato.depth.value = 0.3;
}

function removeVibrato() {
  vibrato.depth.value = 0;
}

function pointerEnter(event) {
  addVibrato();
  console.log("Sounds wobbly.");
}

function pointerMove(event) {
// need to sync movement speed with wobble speed
  let normX = event.clientX / window.innerWidth;
  let normY = event.clientY / window.innerHeight;
  let now = Date.now();
  let distance = Math.hypot(normX - lastX, normY - lastY);
  let seconds = (now - lastTime) / 1000;
  lastX = normX;
  lastY = normY;
  lastTime = Date.now();
  if (seconds === 0) {
  return;
}
  let speed = distance / seconds;

  speeds.push(speed);
  setTimeout(forgetOldest, 500);
  useAverage();
}

function forgetOldest() {
  speeds.shift();
  useAverage();
}

function useAverage() {
  let total = 0;
  for (let i = 0; i < speeds.length; i++) {
    total = total + speeds[i];
  }
  let average = 0;
  if (speeds.length > 0) {
    average = total / speeds.length;
  }
   speedVibrato(average);
  }
  function speedVibrato(average){
  let wobble = 1 + average * 9; // 1 is very slow wobble, 9 is fast wobble
    if (wobble > 10) { // sets a ceiling for wobble speed, so it still sounds musical
      wobble = 10;
    }
    vibrato.frequency.value = wobble;
}
function pointerLeave(event) {
  removeVibrato();
  console.log("Back to normal.");
}


// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.



  // Put your event listener code here
  // example.element.addEventListener("pointerdown", pointerDown); // why doesn't work when I change "window" into "shape", maybe shape.element
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);
  wobbleShape.element.addEventListener("pointerenter", pointerEnter);
  wobbleShape.element.addEventListener("pointerleave", pointerLeave);
  wobbleShape.element.addEventListener("pointermove", pointerMove);
}

setup(); // Always remember to call setup()!
