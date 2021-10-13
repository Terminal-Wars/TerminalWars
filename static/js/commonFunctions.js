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