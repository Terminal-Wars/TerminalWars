// either one of these needs to be set. As far as I'm concerned, one can't be set automatically. if the other doesn't work.
// todo: get this from a config file, maybe?
const socket = new WebSocket("ws://localhost:2191/socket")
// const socket = new WebSocket("wss://battle.ioi-xd.net/socket")

var args, timer;
var ingame, action = 0;
var roomid, name, entry = ""; var arg3 = "";
var logs = document.querySelector("#logs");
var action_re = /^\*(.*?)\*$/; var cmd_re = /^\/(.*?)$/;

function command(com, arg1, arg2) {
  switch(com) {
    case "help":
      logs.innerHTML += `
      /join [roomId] - Join a room <br>
      /upload - Upload a saved game (unimplemented) <br>
      /newfile - Gives you an example file for a save game which you can fill out in your text editor of choice. <br>
      /upload - Upload a saved game file. (unimplemented) <br>
      /newgame - Start a new room. You must have a game file uploaded first. (unimplemented) <br>
      /help - Display this message. <br>
      Typing something without a slash counts as a regular text message.<br>`
      break;
    case "join":
      if(arg1 == "") {logs.innerHTML += `You need to specify a room ID.<br>`;} else {
        if(arg2 != "") {roomid = arg1; name = arg2;}
        logs.innerHTML += `What nickname do you want to join as?<br>`;
        action = -2; 
        arg3 = undefined; 
        // We should do proper async here but I want to do setTimeout instead for compatibility with older browsers.
        // (The newest one avaliable on Windows 98 doesn't support async)
        timer = setInterval(function() {
          if(arg3 == undefined) {action = -2;} else {
            name = arg3;
            roomid = arg1;
            action = 0;
            ingame = 1;
            socket.send(`[{
                  "roomid": "${roomid}",
                  "name": "${name}",
                  "text": "${name} has joined ${roomid}<br>",
                  "action": ${action}
                }]`);
            clearInterval(timer);
          }
        }, 1000);
      }
      break;
  }
}

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