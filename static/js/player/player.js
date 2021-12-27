import {socket, Actions, reload} from '../core/socket.js';
import {delay, solve} from '../commonFunctions.js';
import {command, userID, roomID} from '../core/commands.js';
import {keyboardBuffer} from '../input/keyboard.js';
import {ping} from '../core/ping.js';
import {replacePlaceholders, broadcast} from '../commonFunctions.js';

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
		this.actives = data["actives"];
	}
}

export function addUser(user, arr, us=false) {
	let player = new User({
		"name": user,
		"character": arr["character"],
		"aggressive": arr["aggressive"],
		"hp": arr["hp"],
		"info": arr["info"],
		"passives": arr["passives"],
		"actives": arr["actives"]
	});
	if(us) ourPlayer = player;
	socket.send(JSON.stringify({
		"type":"createuser",
		"data": {
			"roomID": roomID,
			//"data": new Map(Object.entries(player))
			"data": player
		}
	}));
	return 0;
}

export async function updateOurUser() {addUser(userID, ourPlayer, true)};

export async function initActivePlayers() {
	let activePlayersTemp = [];
	// Never cache this because it could be run at any point and there could be new players.
	Actions.GetUsersOnline(roomID).then(r => {
		for (let n = 0; n < r["data"].length; n++) {
			Actions.GetUserInfo(roomID, Object.keys(r["data"][n])).then((r) => {
				let player = new User(r["data"][0]["data"]);
				activePlayersTemp.push(player);
			});
		}
		// sort the array alphabetically
		activePlayersTemp.sort();
		// set ourTurn, if applicable
		setOurTurn();
	});
	activePlayers = activePlayersTemp;
}

export async function initUserAndRoom() {
	await exampleUser.then(r => addUser(userID, r, true));
}

export async function initPassives(user) {
	for(n in user["passives"]) {
		onActivate(user["passives"]["on_activate"])
	}
}

export async function onActivate(active, target) {
	let from = "ioi";
	if(ourPlayer != undefined) from = ourPlayer.character;
	socket.send(JSON.stringify({
		"type":"calcactive",
		"data": {
			"roomID": roomID,
			"active": active,
			"from": from,
			"to": target || "all",
		}
	}));
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
		/*
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
		*/
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
/*
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
*/
export async function setOurTurn() { // whereas advanceTurn() advances the turn counter,
									 // this updates the "ourTurn" value if it's our turn.
    await Promise.all([getParticipants(),getTurn()]).then(async(p) => {
		if(p[0].indexOf(ourPlayer["name"]) == p[1]) ourTurn = 1;
		else ourTurn = 0;
	});
}
