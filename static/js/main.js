import * as c from './canvas.js';
import * as m from './mouse.js';
import { loadDefaultObjects } from './loadDefaultObjects.js';
export let objects = [];

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
}
// we do a little trolling because this class just exists for the sake of cleaner code; 
// in fact i could just do Objects_amount() 
export let Objects = new ObjectClass;

function loop() {
  c.draw();
  c.degrade(16);
}
loadDefaultObjects();
setInterval(loop, 1000/60);