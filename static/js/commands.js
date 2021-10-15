import {socket, Actions} from './socket.js';
import {keyboardBuffer} from './keyboard.js';
import {WIDTH, HEIGHT} from './canvas.js';
import {ping, pingSite} from './ping.js';
import {dropdown, dice} from './commonObjects.js';
import {mousePos, Objects} from './main.js';
import {onActivate, initUserAndRoom, activePlayers, exampleUser} from './player.js';
import {delay} from './commonFunctions.js';
export let userID = ""; export let roomID = ""; 
export let shakeNum = 0; export let usersInRoom;

let invalidMessage = "Invalid or unimplemented command.\n";

export async function command(cmd, arg1="", arg2="", arg3="") {
	switch(cmd) {
		case "help":
			keyboardBuffer.push(`General commands:
			/nick (name) - Set your name. If it's an established nickname in the room you try and join, you will be prompted for a password.
			/join (room) - Join a room.
			Room-specific commands:
			/move (subRoom) - Move to a subroom within a room if you're near it.`);
			break;
		case "user", "nick":
			userID = arg1;
			if(roomID != "") {initUserAndRoom(userID, roomID);}
			break;
		case "join", "room":
			roomID = arg1;
			if(userID != "") {initUserAndRoom(userID, roomID);}
			break;
		case "ping":
			await pingSite().then(function() {
				keyboardBuffer.push("Pong! "+ping+"ms\n");
			});
			break;
		case "bag":
			break;
		case "switch":
			break;
		case "list":
			await Actions.GetUsersOnline(roomID).then(r => {
				console.log(r["data"]["data"])
				for (let n in r["data"]["data"]) {
					keyboardBuffer.push(r["data"]["data"][n]["name"]+"\n");
				}
			});
			break;
		// Below are commands that shouldn't really be here,
		// but they are because I don't feel like moving them to another file,
		// for one reason or another. They cannot be executed via the console.
		// Most will be moved later in development(tm).
		case "activeDropdown":
			await exampleUser.then(function(resp) {
				dropdown(mousePos["x"],mousePos["y"],"attacks",resp[0]["actives"],"userDropdown");
			});
			break;
		case "active":
			Objects.destroyAll("dropdown");
			await exampleUser.then(function(resp) {
				onActivate(resp[0]["actives"][arg1]["on_activate"][0], arg2);
			});
			break;
		case "userDropdown":
			await Actions.GetUsersOnline(roomID).then(r => {
				dropdown(mousePos["x"],mousePos["y"],"users",r["data"]["data"],"active","{index}","{name}");
				//,"arg1":list.indexOf(l)
			});
			break;
		case "attack":
			await Actions.Attack(arg1, arg3, roomID, arg2)
			break;
		case "debug":
			if(window.location.hostname == "localhost") {
				await Actions.MemoryDump(roomID);
			} else {
				keyboardBuffer.push(invalidMessage);
			}
			break;
		default: 
			keyboardBuffer.push(invalidMessage);
			break;
	}
}
