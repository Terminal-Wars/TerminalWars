import {socket, Actions, delay} from './socket.js';
import {keyboardBuffer} from './keyboard.js';
import {WIDTH, HEIGHT} from './canvas.js';
import {ping, pingSite} from './ping.js';
import {dropdown, dice} from './commonObjects.js';
import {mousePos, Objects} from './main.js';
import {onActivate} from './player.js';
export let userID = "ioi"; export let roomID = "room"; 
export let shakeNum = 0; export let usersInRoom;

let exampleUser = fetch('static/js/testPlayer.json').then(resp => resp.text()).then(resp => JSON.parse(resp));
// some example attacks
let exampleAttacks = [{"name":"Punch","damage":5},
	{"name":"Kick","damage":3},
	{"name":"Kablammo Zammo","damage":10,"magic":10},
	{"name":"Alakafuckyou","damage":20,"magic":20,"roll":8}];

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
		case "attackDropdown":
			await exampleUser.then(function(resp) {
				dropdown(mousePos["x"],mousePos["y"],"attacks",resp[0]["actives"]);
			});
			break;
		case "attack":
			Objects.destroyAll("dropdown");
			await exampleUser.then(function(resp) {
				onActivate(resp[0]["actives"][arg1]);
				//usersInRoom = await Actions.GetUsersOnline(roomID);
				//for (const user in usersInRoom["data"]["data"]) {
				//	if(user != userID) {await Actions.Attack(user, userID, roomID, arg1);}
				//}
			});
			break;
		case "ping":
			await pingSite().then(function() {
				keyboardBuffer.push("Pong! "+ping+"\n");
			});
			break;
		case "bag":
			break;
		case "user":
			break;
		case "list":
			usersInRoom = await Actions.GetUsersOnline(roomID);
			async function temp() {for (const user in usersInRoom["data"]["data"]) {
				keyboardBuffer.push(user+"\n");
			}};
			await temp();
			break;
		case "dice":
			await dice();
			break;
		case "shake":
			shakeNum = 10;
			break;
		case "testt":
			for(let i = 0; i <= 150; i++) {keyboardBuffer.push(i+"\n");}
			break;
		default: 
			keyboardBuffer.push("Invalid or unimplemented command.\n");
			break;
	}
}