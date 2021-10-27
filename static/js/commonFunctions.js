import {userID, roomID} from './commands.js';
import {diceSum, foeDiceSum, ourTurn} from './player.js';
import {socket} from './socket.js';
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
    value = value.replace("{myRoll}",diceSum,99)
            .replace("{enemyRoll}",foeDiceSum,99)
            .replace("{sender}",userID,99)
            .replace("{me}",userID,99)
            .replace("{opponent}",target,99)
            .replace("{ourTurn}",ourTurn,99);
    if(userID != "") value = value.replace("{loggedIn}",1,99);
    else value = value.replace("{loggedIn}",0,99);
    return value;
  }
}
export function broadcast(text, user="", blank=false) {
  socket.send(JSON.stringify({"type":"broadcast","data": {"roomID":roomID,"userID":user,"text":text,"blank":blank}}));
}