import {objects, Objects, curObject} from './main.js';
import {socket} from './socket.js';
import {command, userID, roomID} from './commands.js';
import {shiftYBy} from './canvas.js';
export let keyboardBuffer = [];

document.addEventListener("keydown", async function(e) {
	// On Firefox, doing a forward slash causes the search menu to come up
	if(e.key == "/") {e.preventDefault()}
	switch(curObject["win_type"]) {
		// Terminal actions
		case "text":
			if(e.key.length <= 1) curObject["texts"][1] += e.key;
			switch(e.key) {
				case "Enter":
					if(curObject["texts"][1].charAt(0) == "/") {
						let cv = curObject["texts"][1].replace("/","").split(" ");
						command(cv[0], cv[1]);
					} else {
						if(roomID == "") {keyboardBuffer.push("You haven't joined a room. Use /join to set one.\n");}
						if(userID == "") {keyboardBuffer.push("You haven't chosen a username. Use /nick to set one.\n");}
						if(userID != "" && roomID != "") {socket.send(`{"type":"broadcast","data":{"userID":"${userID}", "roomID":"${roomID}", "text":"${curObject["texts"][1]}\\n"}}`);}
					}
					curObject["texts"][1] = curObject["texts"][1].replace(/^(.*)$/, "");
					break;
				case "Backspace":
					curObject["texts"][1] = curObject["texts"][1].replace(/(.){0,1}$/, "");
					break;
				case "ArrowUp":
					shiftYBy(1);
					break;
				case "ArrowDown":
					shiftYBy(-1);
					break;

			};
	}
});