import {socket} from './socket.js';
import {keyboardBuffer} from './keyboard.js';
export let userID = ""; export let roomID = "";

export function command(cmd, arg1="", arg2="") {
	switch(cmd) {
		case "put":
			socket.send(`{"type":"put","data":{"roomID":"test","blockID":"test","data":{"${arg1}": "${arg2}"}}}`);
			break;
		case "get":
			socket.send(`{"type":"get","data":{"roomID":"test","blockID":"test"}}}`);
			break;
		case "nick":
			userID = arg1;
			break;
		case "join":
			roomID = arg1;
			break;
		default: 
			keyboardBuffer.push("Invalid or unimplemented command");

	}
}