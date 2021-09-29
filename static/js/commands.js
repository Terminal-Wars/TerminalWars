import {socket, Actions, delay} from './socket.js';
import {particles} from './main.js';
import {keyboardBuffer} from './keyboard.js';
import {WIDTH, HEIGHT } from './canvas.js';
import {rand} from './particles.js';
export let userID = ""; export let roomID = "room"; 
export let shakeNum = 0; export let usersInRoom;

export async function command(cmd, arg1="", arg2="") {
	switch(cmd) {
		/*
		case "put":
			socket.send(`{"type":"put","data":{"roomID":"test","blockID":"test","data":{"${arg1}": "${arg2}"}}}`);
			break;
		case "get":
			socket.send(`{"type":"get","data":{"roomID":"test","blockID":"test"}}`);
			break;
		*/
		case "help":
keyboardBuffer.push(`General commands:
/nick (name) - Set your name. If it's an established nickname in the room you try and join, you will be prompted for a password.
/join (room) - Join a room.
Room-specific commands:
/move (subRoom) - Move to a subroom within a room if you're near it.`);
			break;
		case "nick":
			if (roomID == "") {keyboardBuffer.push("You need to join a room first first.\n")} else {
				userID = arg1;
				socket.send(`{"type":"put","data":{"roomID":"${roomID}","blockID":"user_${userID}","data":{"health": "200", "inroom":"${roomID}"}}}`);
				socket.send(`{"type":"put","data":{"roomID":"${roomID}","blockID":"${roomID}_users","data":{"${userID}":""}}}`);
			}

			break;
		case "join":
			roomID = arg1;
			break;
		case "attack":
			usersInRoom = await Actions.GetUsersOnline(roomID);
			for (const user in usersInRoom["data"]["data"]) {
				console.log(user);
				await Actions.Attack(user, userID, roomID, 5);
			}
			break;
		case "bag":
			break;
		case "user":
			break;
		case "list":
			usersInRoom = await Actions.GetUsersOnline(roomID);
			for (const user in usersInRoom["data"]["data"]) {
				keyboardBuffer.push(user+"\n");
			}
			break;
		case "shake":
			shakeNum = 10;
			break;
		case "testt":
			for(let i = 0; i <= 150; i++) {keyboardBuffer.push(i+"\n");}
			break;
		case "particle":
			for(let i = 0; i < 500; i++) {if(particles.length < 6000) particles.push({"x":WIDTH/2,"y":HEIGHT/2,"modx":rand(3)-1,"mody":rand(3)-1,"fill":"rgb("+rand(255)+","+rand(255)+","+rand(255)+")"});}
			break;
		default: 
			keyboardBuffer.push("Invalid or unimplemented command.\n");
			break;
	}
}