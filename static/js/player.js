import {socket, Actions, reload} from './socket.js';
import {dice} from './commonObjects.js';
import {delay, solve} from './commonFunctions.js';
import {command, userID, roomID} from './commands.js';
import {keyboardBuffer} from './keyboard.js';
import {ping} from './ping.js';
import {replacePlaceholders, broadcast} from './commonFunctions.js';

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
		//this.passives = data["passives"];
		//this.actives = data["actives"];
	}
}

export function addUser(user, arr, us=false) {
	let player = new User({
		"name": user,
		"character": arr[0]["character"],
		"aggressive": arr[0]["aggressive"],
		"hp": arr[0]["hp"],
		"info": arr[0]["info"]
		//"passives": arr[0]["passives"]
		//"actives": arr["actives"]
	});
	if(us) ourPlayer = player;
	socket.send(JSON.stringify({"type":"put",
		"data": {
			"roomID": roomID,
			"blockID": roomID+"_users",
			"data": [player]
		}
	}));
	return 0;
}

export async function updateOurUser() {addUser(userID, ourPlayer, true)};

export async function initActivePlayers() {
	let activePlayersTemp = [];
	// Never cache this because it could be run at any point and there could be new players.
	Actions.GetUsersOnline(roomID).then(r => {
		for (let n in r["data"]["data"]) {
			let player = new User(r["data"]["data"][n]);
			activePlayersTemp.push(player);
		}
		// sort the array alphabetically
		activePlayersTemp.sort();
		// set ourTurn, if applicable
		setOurTurn();
	});
	activePlayers = activePlayersTemp;
}

export async function initUserAndRoom() {
	await exampleUser.then(r => addUser(userID, r, true))
	.then(broadcast("has joined.\n",userID,true))
	.then(broadcast("℡initActivePlayers"))
	.then(initActivePlayers());
}

export async function initPassives(user) {
	for(n in user["passives"]) {
		onActivate(user["passives"][n]["on_activate"])
	}
}

export async function onActivate(active, target, advance=true) {
	for(let n in active) {
		let cmd = [];
		let cmd_o = active[n];
		for(let val in cmd_o) {
			// ...replace any placeholder values.
			if(typeof cmd_o[val] == "string") {
				cmd[val] = replacePlaceholders(cmd_o[val], target);
			} else {
				cmd[val] = cmd_o[val];
			}
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
				let mod = solve(cmd[3])+solve(ourPlayer["info"]["diceModAttack"] || 0);
				keyboardBuffer.push("modifer -> "+mod+"\n");
				diceSum += solve(mod);
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
				addUser(userID+"楩"+activePlayers.length, cmd[1]);
				initActivePlayers();
				break;
			case "add":
			case "sub":
				if(cmd[2] != "skip") { // WE'LL DO TEAMS LATER OK
					if(cmd[0] == "sub") cmd[3] *= 1; // if i can reuse code i will, fuck you
					if(cmd[1] == userID) {
						ourPlayer["info"][cmd[2]] += cmd[3];
						await updateOurUser();
					} else {
						// todo: handle modifying other player's values.
					}
				}
				break;
			case undefined:
				console.error(cmd);
				break;
			default:
				console.error("Uncaught or unknown command: "+cmd[0]);
				break;
		}
	}
	// Advance the turn.
	// todo: when passives are added, make this only apply to actives.
	if(advance) {
		broadcast("℡advanceTurn");
		broadcast("℡setOurTurn");
	}
}

// Getting battle specific data.
export async function getTurn() {
	if(turn == -1) {
		let serverResult = Actions.GetBattle(roomID).then(function(r) {
			if(["data"]["ok"]) return r["data"]["data"]["turn"];
			else return -2;
		});
		return serverResult;
	} else {
		return turn;
	}
}
export async function getParticipants() {
	if(participants.length == 0) {
		let serverResult = Actions.GetBattle(roomID).then(function(r) {
			if(["data"]["ok"]) return r["data"]["data"]["participants"];
			else return [""];
		});
		participants = serverResult;
		return serverResult;
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
		broadcast("has started a battle!",userID,true);
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
		if(p[0].indexOf(ourPlayer["name"]) == p[1]) ourTurn = 1;
		else ourTurn = 0;
	});
}
