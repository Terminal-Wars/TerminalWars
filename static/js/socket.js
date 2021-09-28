// export const socket = new WebSocket("ws://localhost:2191/socket");
// export const socket = new WebSocket("wss://battle.ioi-xd.net/socket")
export const socket = new WebSocket(await fetch("static/js/websocket_name").then(resp => resp.text()));

import {keyboardBuffer} from './keyboard.js';

socket.addEventListener('open', function (event) {

});

socket.addEventListener('message', function (event) {
    let data = JSON.parse(event.data);
    console.log(data);
    if(data["data"]["data"]["text"] != undefined) {
      keyboardBuffer.push(data["data"]["data"]["userID"]+"> "+data["data"]["data"]["text"]);
    }
});


/*
              socket.send(`[{
                  "roomid": "${roomid}",
                  "name": "${name}",
                  "text": "${entry}",
                  "action": ${action}
                }]`);

socket.addEventListener('open', function (event) {
  var date = new Date(Date.now());
  logs.innerHTML += `Batux 1.0.0 (2021-09-15) ppc64el Vanilla<br>
                     Current time: ${date.toString()}<br>
                     Type /help to see a list of basic commands<br>`;
  document.addEventListener("keydown", function(e) {
    var entry = document.querySelector("#entry").value; 
    if(e.key == "Enter" && entry != "") {
      console.log(action);
        document.querySelector("#entry").value = "";
        if(action == -2) {
          console.log(entry);
          arg3 = entry;
        } else {
          if(entry.match(cmd_re)) {
            args = entry.replace(cmd_re,'$1').split(' ');
            command(args[0], args[1] || "", args[2] || "");
            action = -1;
          }
          if(action >= 0) {
            if(entry.match(action_re)) {
              // Its an action
              action = 1
            } else if(!entry.match(action_re)){action = 0}
            // in game
            if(ingame) {
              socket.send(`[{
                  "roomid": "${roomid}",
                  "name": "${name}",
                  "text": "${entry}",
                  "action": ${action}
                }]`);
            }
          }
        }
    } else {
      document.querySelector("#entry").focus();
    }
  });
});

socket.addEventListener('message', function (event) {
    if(ingame) {
      data = JSON.parse(event.data);
      if(data[0]['roomid'] == roomid) {
          if(data[0]['action'] == 1) {
            logs.innerHTML += "<em>"+data[0]['name']+" "+data[0]['text'].replace(action_re,"$1")+"</em><br>";
          } else {
            logs.innerHTML += data[0]['name']+": "+data[0]['text']+"<br>";
          }
      } 
    }
});
*/