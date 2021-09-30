export let ping = undefined;
export function pingSite() {
  let start = new Date().getTime();
  let http = new XMLHttpRequest();
  http.open("GET", window.location);
  http.onreadystatechange = function() {
    if(http.readyState == 4) {
      let end = new Date().getTime(); 
      ping = (end-start)+20;
    }
  }
  try {
    http.send(null);
  } catch(exception) {
    // this is expected
  }
}