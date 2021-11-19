export let ping = undefined;
export async function pingSite() {
  let start = new Date().getTime();
  fetch(window.location.origin+"/blank").then(function() {
    let end = new Date().getTime();
    ping = (end-start)+20;
  })
}