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
const notes = ["A4", "C4", "D4", "Eb4", "E4", "G4"];
// ---------- State ----------
// State variables are the parts of your program that change over time.
// For example: where the pointer is, how fast it's moving, or whether a drone is on.
// let i = Math.floor(Math.random() * notes.length); // how do I make the blues array have random elements all the time?

// ---------- Sound ----------
// Make the instruments and plug them into the speakers.
const synth = new Tone.PolySynth(Tone.Synth).toDestination(); // can play several notes at once

// ---------- Update ----------
// Update the state. This is called every 100ms.
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}
 // need to update clientX

// ---------- Use ----------
// Use the state to make sound and move shapes. This is called every 100ms.
function use() {
  setTimeout(use, 100); // call use() again in 100 milliseconds
}

// ---------- Controls (Event Handlers) ----------
// Runs every time the pointer goes down: a click, a tap or a pen touch.
function pointerDown(event){
  Tone.start(); // browsers only allow sound after the player has pressed something

  //console.log("Notes playing: ", melody);
  function playNote(note) {
  console.log("Now playing " + notes);
  synth.triggerAttackRelease(notes, "8n", Tone.now())
  }
  playNote(notes);; // atm this plays all the notes in the notes array at the same time when I click on blue rectangle
 }



// ---------- Setup ----------
// Setup is run once, at the start of the program. It sets everything up for us!
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  // Example: a shape near the middle of the window. Replace it with your own.
  const example = createShape("example");
  example.setPosition(0.5, 0.5);
  const shapeOnOff = createShape("shapeOnOff");
  shapeOnOff.setPosition(0.2, 0.5); // why only two shapes appear? need to normalise?
  const shapeTempo = createShape("shapeTempo");
  shapeTempo.setPosition(0.8, 0.5);
  const shapeVolume = createShape("shapeVolume");
  shapeVolume.setPosition(0.5, 0.8);
  shapeVolume.setColour(207, 75, 51);
  shapeVolume.setSize(150);
  shapeVolume.setRoundedness(0);


  // Put your event listener code here
  shapeVolume.element.addEventListener("pointerdown", pointerDown); // why doesn't work when I change "window" into "shape", maybe shape.element
}

setup(); // Always remember to call setup()!
