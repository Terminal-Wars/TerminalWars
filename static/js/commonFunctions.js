import {userID, roomID} from './core/commands.js';
import {socket} from './core/socket.js';

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

export function replacePlaceholders(value, target) { 
  if(typeof(value) != "string") {return value;} else {
    value = value.replace("{me}",userID,99)
                 .replace("{ourTurn}",1,99); // replace this with the ourTurn variable when that's readded
    if(userID != "") value = value.replace("{loggedIn}",1,99);
    else value = value.replace("{loggedIn}",0,99);
    return value;
  }
}

export function broadcast(text, user="", blank=false) {
  socket.send(JSON.stringify({"type":"broadcast","data": {"roomID":roomID,"userID":user,"text":text,"blank":blank}}));
}
export function clamp(num,min,max) {return Math.min(Math.max(num, min),max)}

export function average(arr, len=-1) {
  let result = 0;
  if(len == -1) {
    for(let n in arr) {
      result += arr[n];
    }
    result /= arr.length;
  } else {
    for(n in len) {
      result += arr[n];
    }
    result /= len;
  }
  return result;
}