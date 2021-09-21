import {objects, Objects, curObject} from './main.js';

document.addEventListener("keydown", function(e) {
	switch(curObject["win_type"]) {
		// Terminal actions
		case "text":
			if(e.key.length <= 2) curObject["texts"][1] += e.key;
			if(e.key == "Enter") {
				curObject["texts"][0] += "\n"+curObject["texts"][1];
				curObject["texts"][1] = curObject["texts"][1].replace(/^(.*)$/, "");
			};
			if(e.key == "Backspace") {curObject["texts"][1] = curObject["texts"][1].replace(/(.){0,1}$/, "");};
			console.log(e.key);
	}
})