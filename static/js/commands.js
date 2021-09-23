import {socket} from './socket.js';

export function command(cmd, arg1="", arg2="") {
	switch(cmd) {
		case "put":
			socket.send(`{"type":"put","data":{"roomID":"test","blockID":"test","data":{"${arg1}": "${arg2}"}}}`);
			break;
		case "get":
			socket.send(`{"type":"get","data":{"roomID":"test","blockID":"test"}}}`);
			break;
	}
}