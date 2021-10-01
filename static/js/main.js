import {drawGFX, frameCount} from './canvas.js';
import {degrade} from './degrade.js';
import {drawParticles} from './particles.js';

// initialize the event handlers in the these files
import * as k from './keyboard.js';
import * as m from './mouse.js';
import * as d from './degrade.js';

import { loadDefaultObjects } from './commonObjects.js';
import { pingSite } from './ping.js';
export let objects = []; export let particles = [];
// this should be in mouse.js but for some reason that literally cannot be imported anywhere except here,
// and if i don't import it here then mouse movement just doesn't work.
export let mousePos = [{"x":0,"y":0}];

// for any debug messages.
export let debugBox = document.querySelector(".debug");

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
  // For each object in the objects array...
  await drawGFX();
  await degrade(16);
}
export let curObject = objects[0];

async function frameCounter() {
  debugBox.innerHTML = "Frames drawn in the last second: "+frameCount[0];
  frameCount[0] = 0;
}

loadDefaultObjects();
pingSite();
setInterval(pingSite,10000);
setInterval(loop, 1000/60);
setInterval(frameCounter, 1000);
//setInterval(lowerPriorityLoop, 1000/30);
