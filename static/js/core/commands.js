import {socket, Actions} from './socket.js';
import {keyboardBuffer} from '../input/keyboard.js';
import {ping, pingSite} from './ping.js';
import {dropdown} from '../core/dropdown.js';
import {mousePos, Objects, error, shell} from '../main.js';
import {onActivate, initUserAndRoom, activePlayers, exampleUser, startBattle} from '../player/player.js';
import {delay} from '../commonFunctions.js';
import {play, stop, setModule} from '../audio/micromod/interface.js';
import {shiftYBy} from '../gfx/canvas.js';

import {neofetch} from '../core/programs.js';

export let userID = null; export let roomID = "test"; 
export let shakeNum = 0; export let usersInRoom;

let invalidMessage = "Invalid or unimplemented command.\n";

// todo: rewrite this so that it returns instead of pushing. this will be useful for the inevitable api.
export async function command(cmd, arg1="", arg2="", arg3="") {
	switch(cmd) {
		case "help":
			keyboardBuffer.push(`General commands:
			/nick (name) - Set your name. If it's an established nickname in the room you try and join, you will be prompted for a password.
			/join (room) - Join a room.
			Room-specific commands:
			/move (subRoom) - Move to a subroom within a room if you're near it.`);
			break;
		case "user":
		case "nick":
			if(arg1 == "") {keyboardBuffer.push("Username cannot be blank.\n")} else {
				userID = arg1;
				if(roomID != "") {initUserAndRoom();}
			}
			break;
		case "join":
		case "room":
			if(arg1 == "") {
				keyboardBuffer.push("Joined the hub room.\n");
				roomID = "hub";
			} else {
				roomID = arg1;
			}
			if(userID != "") {initUserAndRoom();}
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
			for (let n in activePlayers) {
				let p = activePlayers[n];
				keyboardBuffer.push(p["character"]+" ("+p["name"]+")\n");
			};
			break;
		case "neofetch":
			keyboardBuffer.push(neofetch());

		break;
		// test commands below
		case "dice":
			socket.send(`{"type":"dicetest"}`);
			break;
		case "battle":
			arg1 = arg1.replace("restart",true,5)
			startBattle(arg1);
			break;
		case "music":
			let f = new FileReader();
			fetch('./addicti.mod').then(function(r){
				setModule(f.readAsArrayBuffer(r));
				play();
			});
			break;
		case "debug":
			Actions.MemoryDump(roomID);
			break;
		case "stop":
			socket.close();
			break;
		default: 
			keyboardBuffer.push(invalidMessage);
			break;
	}
}
export async function privateCommand(cmd, arg1="", arg2="", arg3="") {
	switch(cmd) {
		case "activeDropdown":
			await exampleUser.then(function(resp) {
				dropdown(mousePos["x"],mousePos["y"],"attacks",resp["actives"],"userDropdown","{index}","{name}");
			});
			break;
		case "active":
			Objects.destroyAll("dropdown");
			await exampleUser.then(function(resp) {
				onActivate(resp["actives"][arg1 || 0]["on_activate"][0], arg2);
			});
			break;
		case "userDropdown":
			dropdown(mousePos["x"],mousePos["y"],"users",activePlayers,"active",arg1,arg2);
			break;
			/*
		case "attack":
			await Actions.Attack(arg1, arg3, roomID, arg2)
			break;
			*/
		case "shiftYBy":
			shiftYBy(arg1);
			break;
	}
}