import {drawGFX, degrade} from './canvas.js';
import {drawParticles} from './particles.js';
// these aren't even used but they need to be imported anyways i guess lol
import * as m from './mouse.js';
import * as k from './keyboard.js';

import { loadDefaultObjects } from './commonObjects.js';
import { lowerPriorityLoop } from './lowerPriorityFunctions.js';
import { pingSite } from './ping.js';
export let objects = []; export let particles = [];

export class ObjectClass {
  amount() {
    return objects.length;
  }
  highestZ() {
    let i = 0;
    for(let n = 0; n < objects.length; n++) {
      if(objects[n]["z"] >= i) {i=n;}
    }
    return objects[i];
  }
  setCurrent(obj) {
    curObject = obj;
  }
}
// we do a little trolling because this class just exists for the sake of cleaner code; 
// in fact i could just do Objects_amount() 
export const Objects = new ObjectClass;

async function loop() {
  await drawGFX();
  await drawParticles();
  await degrade(32);
}
export let curObject = objects[0];

loadDefaultObjects();
pingSite();
setInterval(loop, 1000/60);
setInterval(pingSite, 3000);
//setInterval(lowerPriorityLoop, 1000/30);
