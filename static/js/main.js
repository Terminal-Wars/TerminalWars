import {drawGFX, degrade} from './canvas.js';
import {drawParticles} from './particles.js';
// these aren't even used but if they aren't here then nothing works.
import * as k from './keyboard.js';
import * as m from './mouse.js';

import { loadDefaultObjects } from './commonObjects.js';
import { lowerPriorityLoop } from './lowerPriorityFunctions.js';
import { pingSite } from './ping.js';
export let objects = []; export let particles = [];
// this should be in mouse.js but for some reason that literally cannot be imported anywhere except here,
// and if i don't import it here then mouse movement just doesn't work.
export let mousePos = [{"x":0,"y":0}];

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
setInterval(pingSite(),10000);
setInterval(loop, 1000/60);
//setInterval(lowerPriorityLoop, 1000/30);
