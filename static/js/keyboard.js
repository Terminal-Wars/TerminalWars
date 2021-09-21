import {objects, Objects, curObject} from './main.js';
import {socket} from './socket.js';
import {command} from './commands.js';
export let keyboardBuffer = [];

document.addEventListener("keydown", function(e) {
	switch(curObject["win_type"]) {
		// Terminal actions
		case "text":
			if(e.key.length <= 2) curObject["texts"][1] += e.key;
			if(e.key == "Enter") {
				if(curObject["texts"][1].charAt(0) == "/") {
					command(curObject["texts"][1].replace("/",""));
				} else {
					//curObject["texts"][0] += "\n"+curObject["texts"][1];
					socket.send(`[{
						"text": \"${curObject["texts"][1]}\\n\"
					}]`);
				}
				curObject["texts"][1] = curObject["texts"][1].replace(/^(.*)$/, "");
			};
			if(e.key == "Backspace") {curObject["texts"][1] = curObject["texts"][1].replace(/(.){0,1}$/, "");};
	}
})