var args, timer;
var ingame, action = 0;
var roomid, name, entry = ""; var arg3 = "";
var action_re = /^\*(.*?)\*$/; var cmd_re = /^\/(.*?)$/;

function command(win, com, arg1, arg2) {
  switch(com) {
    case "help":
      win.innerHTML += `
      /join [roomId] - Join a room <br>
      /upload - Upload a saved game (unimplemented) <br>
      /newfile - Gives you an example file for a save game which you can fill out in your text editor of choice. <br>
      /upload - Upload a saved game file. (unimplemented) <br>
      /newgame - Start a new room. You must have a game file uploaded first. (unimplemented) <br>
      /help - Display this message. <br>
      Typing something without a slash counts as a regular text message.<br>`
      break;
    case "join":
      if(arg1 == "") {win.innerHTML += `You need to specify a room ID.<br>`;} else {
        if(arg2 != "") {roomid = arg1; name = arg2;}
        win.innerHTML += `What nickname do you want to join as?<br>`;
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
