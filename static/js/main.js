import * as c from './canvas.js';
import * as m from './mouse.js';
import * as k from './keyboard.js';
import * as p from './particles.js';
import { loadDefaultObjects } from './commonObjects.js';
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
  await c.drawGFX();
  await p.drawParticles();
  await c.degrade(32);
}
loadDefaultObjects();
export let curObject = objects[0];
setInterval(loop, 1000/60);