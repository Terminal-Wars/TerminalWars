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
		case "help":
keyboardBuffer.push(`General commands:
/nick (name) - Set your name. If it's an established nickname in the room you try and join, you will be prompted for a password.
/join (room) - Join a room.
Room-specific commands:
/move (subRoom) - Move to a subroom within a room if you're near it.`);
			break;
		case "test":
			for(let i = 0; i <= 150; i++) {keyboardBuffer.push(i+"\n");}
			break;
		default: 
			keyboardBuffer.push("Invalid or unimplemented command.\n");

	}
}