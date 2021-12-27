const a = require('../battle/active.js');

const solve = (str) => {
  // Never solve a non-string or a string with any characters in it.
  let re = /[A-z]/;
  if(typeof(str) != "string") return str;
  if(str.match(re)) return str;
  return Function('"use strict";return ('+str+')')();
}

const replacePlaceholders = (value, from=null, to=null) => { 
  if(typeof(value) != "string") {return value;} else {
    value = value.replace("{myRoll}",a.diceSum,99)
            .replace("{enemyRoll}",a.foeDiceSum,99)
            .replace("{sender}",from,99)
            .replace("{opponent}",to,99); // replace null with ourTurn when that's readded
    return value;
  }
}

module.exports.replacePlaceholders = replacePlaceholders;
module.exports.solve = solve;