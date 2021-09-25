import {objects, Objects, curObject} from './main.js';
import {socket} from './socket.js';
import {command, userID, roomID} from './commands.js';
export let keyboardBuffer = [];

document.addEventListener("keydown", function(e) {
	switch(curObject["win_type"]) {
		// Terminal actions
		case "text":
			if(e.key.length <= 1) curObject["texts"][1] += e.key;
			if(e.key == "Enter") {
				if(curObject["texts"][1].charAt(0) == "/") {
					let cv = curObject["texts"][1].replace("/","").split(" ");
					command(cv[0], cv[1]);
				} else {
					console.log(userID);
					if(userID == "") {keyboardBuffer.push("You haven't chosen a username. Use /nick to set one.\n");}
					else if(roomID == "") {keyboardBuffer.push("You haven't joined a room. Use /room to set one.\n");}
					else {socket.send(`{"type":"broadcast","data":{"text":\"${curObject["texts"][1]}\\n\"}}`);}
					console.log(keyboardBuffer);
				}
				curObject["texts"][1] = curObject["texts"][1].replace(/^(.*)$/, "");
			};
			if(e.key == "Backspace") {curObject["texts"][1] = curObject["texts"][1].replace(/(.){0,1}$/, "");};
	}
});