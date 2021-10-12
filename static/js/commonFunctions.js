export async function delay(time, variable=undefined) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {resolve(variable);},time);
  })
}