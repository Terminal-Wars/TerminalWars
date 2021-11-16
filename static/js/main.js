import {drawGFX, frameCount, frameTime, resetFrameTime} from './canvas.js';
import {degrade} from './degrade.js';
import {drawParticles} from './particles.js';

// initialize the event handlers in the these files
import * as k from './keyboard.js';
import * as m from './mouse.js';
import * as d from './degrade.js';

import { loadDefaultObjects, diceUpdate } from './commonObjects.js';
import { pingSite } from './ping.js';
export let objects = []; export let particles = [];
export let objects_dice = [];
// this should be in mouse.js but for some reason that literally cannot be imported anywhere except here,
// and if i don't import it here then mouse movement just doesn't work.
export let mousePos = [{"x":0,"y":0}];

// for any debug messages.
export let debugBox = document.querySelector(".debug");
export let debugBox2 = document.querySelector(".debug2");
export let debugBox3 = document.querySelector(".debug3");
export let debugBox4 = document.querySelector(".debug4");
export let notices = document.querySelector(".notices");

// fatal error
export let fatalError = 0;

export class ObjectClass {
  amount() {
    return objects.length;
  }
  // todo: create a function to replace objects.push, and just have that function set the highest Z
  highestZ() {
    let i = 0;
    for(let n = 0; n < objects.length; n++) {
      if(objects[n]["z"] >= i) {i=n;}
    }
    return objects[i];
  }
  async destroyAll(type) {
    for(let n in objects) {
      if(objects[n]["type"] == type) {
        objects.splice(n,n);
      }
    }
  }
  setCurrent(obj) {
    curObject = obj;
  }
}
// we do a little trolling because this class just exists for the sake of cleaner code; 
// in fact i could just do Objects_amount() 
export const Objects = new ObjectClass;

async function loop() {
  try {
    drawGFX();
    requestAnimationFrame(loop);
  } catch(ex) {
        document.querySelector('.error').style.display = 'block';
        document.querySelector('.error span').innerHTML = ex.stack.replace(/\n/g,"<br>",4);
        fatalError = 1;
      }
}
async function loop60() {
  await diceUpdate();
}
export let curObject = objects[0];

async function frameCounter() {
  debugBox.innerHTML = frameTime+" FPS";
  resetFrameTime();
}

async function init() { // redundant, but it's here for compatibility
  loadDefaultObjects();
  pingSite();
  setInterval(pingSite,3000); // ping the site and update it every three seconds.
  if(window.location.hostname == "localhost") setInterval(frameCounter, 1000);
  loop();
  setInterval(loop60, 1000/15);
  //setInterval(lowerPriorityLoop, 1000/30);
}
init();