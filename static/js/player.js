import {socket, Actions, reload} from './socket.js';
import {dice} from './commonObjects.js';
import {delay, solve} from './commonFunctions.js';
import {command, userID, roomID} from './commands.js';
import {keyboardBuffer} from './keyboard.js';
import {ping} from './ping.js';
import {asyncResult, replacePlaceholders} from './commonFunctions.js';

export let diceSum = 0; export let foeDiceSum = 0;
export let turn = -1; // Cached value for whoever's turn it is.
export let battleStarted = -1; // Cached value for whether a battle is started.
export let ourTurn = 0; // Whether or not it's our turn.

export let activePlayers = [];
export let participants = []; // for when we only need the names (i.e. when sending this back to the server).

export let ourPlayer;

export let exampleUser = fetch('static/js/testPlayer.json').then(resp => resp.text()).then(resp => JSON.parse(resp));
class User {
	constructor(data) {
		this.name = data["name"];
		this.character = data["character"];
		this.aggressive = data["aggressive"];
		this.hp = data["hp"];
		this.info = data["info"];
		this.passives = data["passives"];
		//this.actives = data["actives"];
	}
}

export async function initUserAndRoom() {
	activePlayers.length = 0; 
	await asyncResult(exampleUser).then(r => {
	// Get the relevant options from the json file.
	ourPlayer = new User({
		"name": userID,
		"character": r[0]["character"],
		"aggressive": r[0]["aggressive"],
		"hp": r[0]["hp"],
		"info": r[0]["info"],
		"passives": r[0]["passives"]
		//"actives": r[0]["actives"]
	});
	// Add the new user to the server
	socket.send(JSON.stringify({"type":"put",
		"data": {
			"roomID": roomID,
			"blockID": roomID+"_users",
			"data": [ourPlayer]
		}
	}));
	});
	Actions.GetUsersOnline(roomID).then(r => {
		for (let n in r["data"]["data"]) {
			let player = new User(r["data"]["data"][n]);
			activePlayers.push(player);
		}
		// sort the array alphabetically
		activePlayers.sort();
		// set ourTurn, if applicable
		setOurTurn();
	});
}

export async function onActivate(active, target, advance=true) {
	for(let n in active) {
		let cmd = [];
		let cmdo = active[n];
		// For all values in the command except the command itself...
		for(let i = 0; i < cmdo.length; i++) {
			// ...replace any placeholder values.
			try {
				cmd[i] = replacePlaceholders(cmdo[i], target);
			} catch(ex) {console.log(ex)} //this is horrid practice but i don't feel like accounting for every error atm
		}
		switch(cmd[0]) {
			case "roll":
				diceSum = 0;
				foeDiceSum = 0;
				let diceAmount = solve(cmd[1]);
				// amount, max, modifier
				keyboardBuffer.push("rolling "+cmd[1]+"d"+cmd[2]+"+"+solve(cmd[3])+"("+cmd[3]+")\n")
				for(let i = 0; i < diceAmount; i++) {
					await dice(cmd[2],false).then(r => {
						keyboardBuffer.push("dice roll -> "+r["value"]+"\n");
						diceSum += r["value"];
					});
				}
				keyboardBuffer.push("modifer -> "+solve(cmd[3])+"\n");
				diceSum += solve(cmd[3]);
				// todo: know the opponent so that we can factor in their roll type, amount, etc.
				await dice(20,true).then(r => {foeDiceSum += r["value"]});
				if(diceSum > foeDiceSum) {
					keyboardBuffer.push("success, your dice sum: "+diceSum+", foe's dice sum: "+foeDiceSum+"\n");
					onActivate(cmd[4][0], target, false);
				} else {
					keyboardBuffer.push("failure, your dice sum: "+diceSum+", foe's dice sum: "+foeDiceSum+"\n");
					onActivate(cmd[5][0], target, false);
				}
				break;
			case "attack":
				command("attack",cmd[1],Math.floor(solve(cmd[2])+1),userID);
				break;
			case "bot":
				activePlayers.push(cmd[1]);
				break;
			default:
				console.error("Uncaught or unknown command: "+cmd[0]);
				break;
		}
	}
	// Advance the turn.
	// todo: when passives are added, make this only apply to actives.
	if(advance) {
		socket.send(JSON.stringify({"type":"broadcast","data": {"roomID":roomID,"userID":"","text":"℡advanceTurn"}}));
		socket.send(JSON.stringify({"type":"broadcast","data": {"roomID":roomID,"userID":"","text":"℡setOurTurn"}}));
	}
}

// Getting battle specific data.
export async function getTurn() {
	if(turn == -1) {
		let serverResult = Actions.GetBattle(roomID).then(function(r) {
			return r["data"]["data"]["turn"];
		});
		return asyncResult(serverResult);
	} else {
		return turn;
	}
}
export async function getParticipants() {
	if(participants.length == 0) {
		let serverResult = Actions.GetBattle(roomID).then(function(r) {
			return r["data"]["data"]["participants"];
		});
		participants = serverResult;
		return asyncResult(serverResult);
	} else {
		return participants;
	}
}

export async function startBattle(restart) {
	let battleStartMessage = "A battle has already started in this room!\n";
	function start() {
		for (let n in activePlayers) {
			participants.push(activePlayers[n]["name"]);
		}
		socket.send(JSON.stringify({
			"type": "put", 
			"data": {
				"roomID":roomID,
				"blockID": "battle",
				"data": {
					"value":true,
					"participants": participants,
					"turn": 0
				}
			}
		}));
		socket.send(JSON.stringify({
			"type": "broadcast", 
			"data": {
				"blank":true,
				"roomID":roomID,
				"userID":userID,
				"text":"has started a battle!"
			}
		}));
		battleStarted = 1;
		turn = 0;
		uploadTurn(turn);
		setOurTurn();
	}
	switch(battleStarted) {
		case -1: // We don't know if it's started, actually.
			await Actions.GetBattle(roomID).then(function(r) {
				if(restart || r["data"]["ok"] == false || r["data"]["value"] == false) {
					start();
				} else {
					keyboardBuffer.push(battleStartMessage);
					battleStarted = 0;
				}
			});
			break;
		case 0: // We know that one hasn't started.
			start();
			break;
		case 1: // We know that one has started.
			keyboardBuffer.push(battleStartMessage);
			break;
	}
}

export async function advanceTurn() {
	// todo: going through the player list alphabetically works for now, but it should eventually be changed.
	await getTurn().then(function(r) {
		// We want to set the global "turn" variable.
		turn = r;
		if(turn < activePlayers.length-1) turn++
		else turn = 0;
		uploadTurn(turn);
	})
}

export async function uploadTurn(turn) {
	socket.send(JSON.stringify({
		"type":"put",
		"data": {
			"roomID":roomID,
			"blockID":"battle",
			"data": {
				"turn":turn
			}
		}
	}));
}

export async function setOurTurn() { // whereas advanceTurn() advances the turn counter,
									 // this updates the "ourTurn" value if it's our turn.
    await Promise.all([getParticipants(),getTurn()]).then(async(p) => {
    	console.log(p[0].indexOf(ourPlayer["name"])+" == "+p[1]);
		if(p[0].indexOf(ourPlayer["name"]) == p[1]) ourTurn = 1;
		else ourTurn = 0;
	});
}
