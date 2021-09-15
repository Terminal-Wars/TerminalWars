// either one of these needs to be set. As far as I'm concerned, one can't be set automatically. if the other doesn't work.
// after commenting out the correct variable, you will need to copy or rename this to url.js
// DELETE THESE COMMENTS AS WELL.
//const socket = ws://localhost:2191/socket
//const socket = wss://ipv4.ioi-xd.net:2191/socket

let ingame = 0;
let roomid, name
let entry = "";
let logs = document.querySelector("#logs");

socket.addEventListener('open', function (event) {
  document.addEventListener("keydown", function(e) {
    let entry = document.querySelector("#entry").value; 
    if(e.key == "Enter" && entry != "") {
        document.querySelector("#entry").value = "";
        switch(ingame) {
          case 0:
            // room number
            roomid = entry;
            logs.innerHTML += roomid+"<br>And what's your name? ";
            ingame++;
            break;
          case 1:
            // name
            name = entry;
            logs.innerHTML += name+"<br>";
            ingame++;
            break;
          case 2:
            // in game
            socket.send(`[{
                "roomid": "${roomid}",
                "name": "${name}",
                "text": "${entry}"
              }]`);
            break;
      }
    }
  });
});

socket.addEventListener('message', function (event) {
    data = JSON.parse(event.data);
    if(data[0]['roomid'] == roomid) {
        logs.innerHTML += data[0]['name']+": "+data[0]['text']+"<br>";
    } 
});