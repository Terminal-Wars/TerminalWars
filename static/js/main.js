import {drawGFX, degrade} from './canvas.js';
import {drawParticles} from './particles.js';
// these aren't even used but they need to be imported anyways i guess lol
import * as m from './mouse.js';
import * as k from './keyboard.js';

import { loadDefaultObjects } from './commonObjects.js';
import { lowerPriorityLoop } from './lowerPriorityFunctions.js';
export let objects = []; export let particles = [];
export let ping = 0;

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

export async function pingSite() {
  let start = new Date().getTime();
  let http = new XMLHttpRequest();
  http.open("GET", window.location);
  http.onreadystatechange = function() {
    if(http.readyState == 4) {
      let end = new Date().getTime(); 
      return (end-start)+20;
    }
  }
}

async function loop() {
  await drawGFX();
  await drawParticles();
  await degrade(32);
}
export let curObject = objects[0];

ping = pingSite();
loadDefaultObjects();
setInterval(loop, 1000/60);
setInterval(lowerPriorityLoop, 1000/30);