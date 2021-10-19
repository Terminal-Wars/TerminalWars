import {userID, roomID} from './commands.js';
import {diceSum, foeDiceSum} from './player.js';

export async function delay(time, variable=undefined) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {resolve(variable);},time);
  })
}
export function solve(str) {
  // Never solve a non-string or a string with any characters in it.
  let re = /[A-z]/;
  if(typeof(str) != "string") return str;
  if(str.match(re)) return str;
  return Function('"use strict";return ('+str+')')();
}
export async function asyncResult(result) {return result;} // Hacky way of getting the exact value we need from an asynchronous promise.

export function replacePlaceholders(value, target) { 
  if(typeof(value) != "string") {return value;} else {
    value = value.replace("myRoll",diceSum,99)
            .replace("enemyRoll",foeDiceSum,99)
            .replace("sender",userID,99)
            .replace("opponent",target,99);
    return value;
  }
}