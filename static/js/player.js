import {dice} from './commonObjects.js';
import {solve} from './commonFunctions.js';
import {command, userID} from './commands.js';
import {keyboardBuffer} from './keyboard.js';
export let diceSum = 0; export let foeDiceSum = 0;

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
				command("attack",cmd[1],Math.floor(solve(cmd[2])+1),userID)
			default:
				console.error("Uncaught or unknown command: "+cmd[0]);
				break;
		}
	}
}