import {socket, Actions, reload} from './socket.js';
import {dice} from './commonObjects.js';
import {delay, solve} from './commonFunctions.js';
import {command, userID, roomID} from './commands.js';
import {keyboardBuffer} from './keyboard.js';
import {ping} from './ping.js';
export let diceSum = 0; export let foeDiceSum = 0;
export let turn = -1;
export let battleStarted = 0; // Cached value for whether a battle is started.

export let activePlayers = [];
export let exampleUser = fetch('static/js/testPlayer.json').then(resp => resp.text()).then(resp => JSON.parse(resp));
// can you feel me rolling my eyes right now
export async function getExampleUser() {return exampleUser};
class User {
	constructor(data) {
		this.name = data["name"];
		this.owner = data["owner"];
		this.aggressive = data["aggressive"];
		this.hp = data["hp"];
		this.info = data["info"];
		this.passives = data["passives"];
		this.actives = data["actives"];
	}
}

export async function initUserAndRoom() {
	console.log(userID);
	activePlayers.length = 0; 
	await getExampleUser().then(r => {
	// Get the relevant options from the json file.
	// This should always be the first entry in the list.
	let player = new User({
		"name": r[0]["name"],
		"owner": userID,
		"aggressive": r[0]["aggressive"],
		"hp": r[0]["hp"],
		"info": r[0]["info"],
		"passives": r[0]["passives"],
		"actv": r[0]["actives"]
	}); 
	// Add the new user to the server
	socket.send(JSON.stringify({"type":"put",
		"data": {
			"roomID": roomID,
			"blockID": roomID+"_users",
			"data": [{
					"name": player.name,
					"owner": player.owner,
					"aggressive": player.aggressive,
					"hp": player.hp,
					"info": player.info,
					"passives": player.passives,
					"actv": player.actives
				}
			]
		}
	}));
	});
	Actions.GetUsersOnline(roomID).then(r => {
		for (let n in r["data"]["data"]) {
			let player = new User(r["data"]["data"][n]);
			activePlayers.push(player);
		}
	});
	// sort the array alphabetically
	activePlayers.sort();
}

export function replacePlaceholders(value, target) { 
	if(typeof(value) != "string") {return value;} else {
		value=value.replace("myRoll",diceSum,99)
				   .replace("enemyRoll",foeDiceSum,99)
				   .replace("sender",userID,99)
				   .replace("opponent",target,99);
		return value;
	}
}

export async function onActivate(active, target) {
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
					onActivate(cmd[4][0], target);
				} else {
					keyboardBuffer.push("failure, your dice sum: "+diceSum+", foe's dice sum: "+foeDiceSum+"\n");
					onActivate(cmd[5][0], target);
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
	advanceTurn();
}

export async function startBattle() {
	await Actions.HasBattleStarted(roomID).then(function(r) {
		if(r["data"]["ok"] == false || r["data"]["value"] == false) {
			socket.send(`{"type": "put", "data": {"roomID":"${roomID}","blockID": "battleInProgress","data":{"value":true}}}`);
			socket.send(`{"type": "broadcast", "data": {"blank":true,"roomID":"${roomID}","userID":"${userID}","text":"has started a battle!"}`)
			let battleStarted = 1;
		} else {
			keyboardBuffer.push("A battle has already started in this room!\n");
			let battleStarted = 0;
		}
	})
}

export async function advanceTurn() {
	// todo: going through the player list alphabetically works for now, but it should eventually be changed.
	if(turn > activePlayers.length) turn++
	else turn = 0;
}