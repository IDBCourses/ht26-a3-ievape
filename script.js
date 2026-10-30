import { createShape } from "./shape.js";

// ---------- Settings ----------

const notes = ["C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"];
const keys = {}; // will hold each shape, looked up by its note name
const keyboard = {
  a: "C4", w: "C#4", s: "D4", e: "D#4", d: "E4", f: "F4",
  r: "F#4", g: "G4", t: "G#4", h: "A4", y: "A#4", j: "B4",
};

const restWidth = 600;
const restHeight = 150;
const centreX = 0.5; // where the shape's middle sits, where 0 is left edge of the window, 1 ir the right edge.
const centreY = 0.5; // same but top to bpttom
const restColour = [200, 80, 50]; // colour when the pointer is outside
const activeColour = [330, 90, 60]; // colour when the pointer is inside the shape
const pulseSize = 15; // how many pixels the shape growns and shrinks while pulsing


const wobbleShape = createShape("wobbleShape");
wobbleShape.setPosition(0.5, 0.5);
wobbleShape.setRoundedness(0.4);
wobbleShape.setColour(restColour[0], restColour[1], restColour[2]); // a known starting colour to return to
placeShape(restWidth, restHeight);

for (let i = 0; i < notes.length; i++) {
  const note = notes[i];
  const isBlack = note.includes("#"); // attribute .includes selects notes with hashtags in them

  let x = i * 0.05; // shapes are alocated across x axis every 0.05 screen units
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

// gives the shape width and heigth, and keeps its middle at (centreX, centreY).
function placeShape(width, heigth) {
  wobbleShape.element.style.width = width + "px";
  wobbleShape.element.style.height = heigth + "px";
   const left = centreX - (width / 2) / window.innerWidth;
   const top = centreY - (heigth /2) / window.innerHeight;
   wobbleShape.setPosition(left, top);
}

// ---------- State ----------

let lastX = 0;
let lastY = 0;
let lastTime = 0;
let speeds = [];
let inside = false; // checks if the pointer is inside the shape to know when to pulse
let pulseTime = 0; // countes up while the shape is pulsing; Math.sin turns it into a swooth swing;

// ---------- Sound ----------
const synth = new Tone.PolySynth(Tone.Synth); // can play several notes at once, deleted .toDestination so it doesn't interfere with vibrato effect
let vibrato = new Tone.Vibrato(2, 0); // speed (wobbles per second) and depth, speed (0 = off, 1 = max)
synth.chain(vibrato, Tone.Destination);

let lowpass = new Tone.Filter(20000, "lowpass"); // cuts above 20000 Hz = nothing yet
let hightpass = new Tone.Filter(20, "highpass"); // cuts below 20 Hz = nothing yet
// the sound goes through both effects in order: first it is wobbled, then filtered, then it reaches speakers.
synth.chain(vibrato, lowpass, hightpass, Tone.Destination);

// ---------- Update ----------
function update() {
  setTimeout(update, 100); // call update() again in 100 milliseconds
}

// ---------- Use ----------
function use() {
  if (inside) {
    pulseTime = pulseTime + 0.04; // use() runs every 0.04 seconds (why?), so this counts real seconds
  // Math.sin glides smoothly between -1 and 1 and back, over and over.
  // MUltiplying by pulseSize turns that into "between -15 and +15 pixels.
  // The * 6 sets the tempo: roughly one pulse per second.
  const pulse = Math.sin(pulseTime * 6) * pulseSize;
  placeShape(restWidth + pulse, restHeight + pulse); // analyse the math here later
  }
  setTimeout(use, 40); // call use() again in 40 milliseconds; moving the shape in small steps more often makes the pulse look smooth.
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

function shapeEnter(event) {
  inside = true; // tells use() to start pulsing.
  pulseTime = 0; // start every pulse from resting size, so it doesn't jump.
  wobbleShape.setColour(activeColour[0], activeColour[1], activeColour[2]);

  // start measuring speed from where the pointer is now, not from where the pointer left the shape last time.
  lastX = event.clientX / window.innerWidth;
  lastY = event.clientY / window.innerHeight;
  lastTime = Date.now();

  wobbleEnter(event); // vibrato on
  filterMove(event); // filter on
}

function shapeMove(event) {
  wobbleMove(event); // speed over time -> vibrato speed
  filterMove(event); // position along x -> low to high pass
}

function shapeLeave(event) {
  inside = false;
  placeShape(restWidth, restHeight);
  wobbleShape.setColour(restColour[0],restColour[1], restColour[2]);

  wobbleLeave(event);
  filterLeave(event);
}

function wobbleEnter(event) {
  vibrato.depth.value = 0.3;
  console.log("Sounds wobbly.");
}

function wobbleMove(event) {
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
function wobbleLeave(event) {
  vibrato.depth.value = 0;
  console.log("Back to normal.");
}

function filterMove(event) {
  const box = wobbleShape.element.getBoundingClientRect();
  let amount = (event.clientX - box.left) / box.width;

  if(amount < 0.5){
   // turns left half from 0-0.5 to 0-1, 0 being left edge, and 1 being the middle
    const t = amount / 0.5;

  lowpass.frequency.value = 200 * Math.pow(100, t);
  hightpass.frequency.value = 20; // high-pass open, cuts nothing
  } else {
    const t = (amount - 0.5) / 0.5; //turns the right half from 0.5-1 to 0-1
    hightpass.frequency.value = 20 * Math.pow(100, t);
    lowpass.frequency.value = 20000; // low-pass open, cuts nothing
  }
}

function filterLeave(event){
  hightpass.frequency.value = 20000;
  lowpass.frequency.value = 20;
  console.log("Filter is off.");
}
// ---------- Setup ----------
function setup() {
  update(); // start the update loop
  use(); // start the use loop

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  wobbleShape.element.addEventListener("pointerenter", shapeEnter);
  wobbleShape.element.addEventListener("pointerleave", shapeLeave);
  wobbleShape.element.addEventListener("pointermove", shapeMove);
}

setup(); // Always remember to call setup()!

