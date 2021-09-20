// either one of these needs to be set. As far as I'm concerned, one can't be set automatically. if the other doesn't work.
// todo: get this from a config file, maybe?
export const socket = new WebSocket("ws://localhost:2191/socket")
// const socket = new WebSocket("wss://battle.ioi-xd.net/socket")

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