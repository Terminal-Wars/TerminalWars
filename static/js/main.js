import {drawGFX, frameCount, frameTime, resetFrameTime} from './gfx/canvas.js';
import {drawParticles} from './gfx/particles.js';

// initialize the event handlers in the these files
import * as k from './input/keyboard.js';
import * as m from './input/mouse.js';
import * as d from './gfx/degrade.js';

import { loadDefaultObjects, diceUpdate } from './commonObjects.js';
import { pingSite } from './core/ping.js';
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

// intervals
let pingInterval; let fpsInterval; let loop60Interval;

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
  if(!fatalError) {
    try {
      drawGFX();
      requestAnimationFrame(loop);
    } catch(ex) {
      error(ex.stack.replace(/\n/g,"<br>",4));
    }
  } else {
    clearInterval(pingInterval);
  }
}

async function loop60() {
  if(!fatalError) {
    try {
      diceUpdate();
     } catch {
      error(ex.stack.replace(/\n/g,"<br>",4));
     } 
  } else {
    clearInterval(loop60Interval);
  }
}

export let curObject = objects[0];

function frameCounter() {
  if(!fatalError) {
    debugBox.innerHTML = frameTime+" FPS";
    resetFrameTime();
  } else {
    clearInterval(fpsInterval);
  }
}

export function error(message) {
    document.querySelector('.error').style.display = 'block';
    document.querySelector('.error span').innerHTML = message;
    fatalError = 1;
}

loadDefaultObjects();
pingSite();
pingInterval = setInterval(pingSite,3000); // ping the site and update the ping value every three seconds.
// we don't use requestAnimationFrame because this NEEDS to execute once a second
fpsInterval = setInterval(frameCounter, 1000);
loop60Interval = setInterval(loop60, 1000/60);
loop();