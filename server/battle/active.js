const b = require("../core/broadcast.js");
const c = require("../core/common.js");
const d = require("./dice.js");

let diceSum = 0; let oppDiceSum = 0;

const calcActive = async (data) => {
	let roomID = data.roomID || null;
	let active = data.active || null;
	let from = data.from || null;
	let to = data.to || "all";
	for(let n in active) {
		let cmd = [];
		let cmdo = active[n];
		// For all values in the command except the command itself...
		for(let i = 0; i < cmdo.length; i++) {
			// ...replace any placeholder values.
			cmd[i] = c.replacePlaceholders(cmdo[i], from, to);
		}
		switch(cmd[0]) {
			case "roll":
				b.broadcast({"roomID": roomID, "userID": "", "text": `Rolled ${cmd[1]} d${cmd[2]}+${cmd[3]}.`, "blank":true});
				let dices = d.sendDice(roomID, c.solve(cmd[2]), c.solve(cmd[1]), c.solve(cmd[3]), false);
				if(dices.length == 1) diceSum = dices[0];
				else for(let n in dices) diceSum += dices[n];
				// todo: know the opponent so that we can factor in their roll type, amount, etc.
				let oppDices = d.sendDice(roomID,20,1,0,true);
				b.broadcast({"roomID": roomID, "userID": "", "text": `Rolled enemy's 1d20+0.`, "blank":true});
				console.log(oppDices);
				if(oppDices.length == 1) oppDiceSum = oppDices[0];
				else for(let n in oppDices) oppDiceSum += oppDices[n];
				if(diceSum > oppDiceSum) {
					if(cmd[4] != undefined) {
						calcActive({"roomID": roomID, "active": cmd[4][0], "from": from, "to": to});
						b.broadcast({"roomID": roomID, "userID": "", "text": "Roll succeeded.", "blank":true});
					}
				} else {
					if(cmd[5] != undefined) {
						calcActive({"roomID": roomID, "active": cmd[5][0], "from": from, "to": to});
						b.broadcast({"roomID": roomID, "userID": "", "text": "Roll failed.", "blank":true});
					}
				}
				break;/*
			case "attack":
				//command("attack",cmd[1],Math.floor(solve(cmd[2])+1),userID);
				break;
			case "bot":
				//activePlayers.push(cmd[1]);
				break;*/
			default:
				console.error("Uncaught or unknown command: "+cmd[0]);
				break;
		}
	}
}

exports.diceSum = diceSum;
exports.oppDiceSum = oppDiceSum;
exports.foeDiceSum = oppDiceSum;
exports.calcActive = calcActive